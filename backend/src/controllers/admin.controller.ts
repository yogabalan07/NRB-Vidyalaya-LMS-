import type { Request, Response } from "express";
import { getSupabaseClient } from "../config/database.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { calculatePagination } from "../utils/pagination.js";

type AdminRequest = Request & { user?: { id: string; email: string; role: string } };

export async function listUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const search = String(req.query.search || "");
    const role = String(req.query.role || "");
    const status = String(req.query.status || "");

    const { page: safePage, limit: safeLimit, offset } = calculatePagination(page, limit);
    const supabase = getSupabaseClient();

    let query = supabase
      .from("profiles")
      .select("id,email,full_name,role,phone,avatar_url,status,created_at,updated_at", { count: "exact" });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq("role", role);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + safeLimit - 1);

    if (error) throw error;

    sendPaginated(res, data || [], count || 0, safePage, safeLimit);
  } catch (err) {
    console.error("[admin] listUsers error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to list users", 500);
  }
}

export async function getUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,phone,avatar_url,status,created_at,updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      sendError(res, "User not found", 404);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, "Failed to get user", 500);
  }
}

export async function createUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email, password, fullName, phone, role, status } = req.body;
    const supabase = getSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (authError) {
      sendError(res, authError.message, 400);
      return;
    }

    if (!authData.user) {
      sendError(res, "Failed to create user", 500);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role,
        status: status || "active",
      }, { onConflict: "id" });

    if (profileError) {
      sendError(res, "User created but profile setup failed: " + profileError.message, 500);
      return;
    }

    sendSuccess(res, {
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
      status: status || "active",
    }, 201);
  } catch {
    sendError(res, "Failed to create user", 500);
  }
}

export async function updateUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { fullName, phone, role, status } = req.body;
    const supabase = getSupabaseClient();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone || null;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select("id,email,full_name,role,phone,avatar_url,status,created_at,updated_at")
      .single();

    if (error) {
      sendError(res, error.message, 400);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, "Failed to update user", 500);
  }
}

export async function deleteUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const adminReq = req as AdminRequest;
    const supabase = getSupabaseClient();

    if (adminReq.user?.id === id) {
      sendError(res, "Cannot delete your own account", 400);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      sendError(res, profileError.message, 400);
      return;
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(String(id));
    if (authError) {
      sendError(res, "Profile deleted but auth user cleanup failed: " + authError.message, 500);
      return;
    }

    sendSuccess(res, { message: "User deleted successfully" });
  } catch {
    sendError(res, "Failed to delete user", 500);
  }
}

// ─── Materials ─────────────────────────────────────────────

export async function listMaterials(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const search = String(req.query.search || "");
    const courseId = String(req.query.courseId || "");

    const { page: safePage, limit: safeLimit, offset } = calculatePagination(page, limit);
    const supabase = getSupabaseClient();

    let query = supabase
      .from("study_materials")
      .select("id,course_id,title,description,file_url,file_type,file_size,drive_url,file_name,created_by,uploaded_by,sort_order,created_at,updated_at", { count: "exact" });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data: materials, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + safeLimit - 1);

    if (error) {
      console.error("[admin] listMaterials Supabase error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    // Enrich with course titles and creator names using batch queries
    const courseIds = [...new Set((materials || []).map((mat) => mat.course_id).filter(Boolean))];
    const creatorIds = [...new Set((materials || []).map((mat) => mat.created_by || mat.uploaded_by).filter(Boolean))];

    const [courseResults, creatorResults] = await Promise.all([
      courseIds.length > 0
        ? supabase.from("courses").select("id,title").in("id", courseIds)
        : { data: [], error: null },
      creatorIds.length > 0
        ? supabase.from("profiles").select("id,full_name").in("id", creatorIds)
        : { data: [], error: null },
    ]);

    const courseMap = new Map<string, string>();
    (courseResults.data || []).forEach((c: { id: string; title: string }) => courseMap.set(c.id, c.title));

    const creatorMap = new Map<string, string>();
    (creatorResults.data || []).forEach((p: { id: string; full_name: string }) => creatorMap.set(p.id, p.full_name));

    const enriched = (materials || []).map((mat) => ({
      ...mat,
      courseName: courseMap.get(mat.course_id) || "",
      creatorName: creatorMap.get(mat.created_by || mat.uploaded_by) || "",
    }));

    sendPaginated(res, enriched, count || 0, safePage, safeLimit);
  } catch (err) {
    console.error("[admin] listMaterials error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to list materials", 500);
  }
}

export async function getMaterial(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data: material, error } = await supabase
      .from("study_materials")
      .select("id,course_id,title,description,file_url,file_type,file_size,drive_url,file_name,created_by,uploaded_by,sort_order,created_at,updated_at")
      .eq("id", id)
      .single();

    if (error || !material) {
      sendError(res, "Material not found", 404);
      return;
    }

    let courseName = "";
    let creatorName = "";

    if (material.course_id) {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", material.course_id)
        .single();
      courseName = course?.title || "";
    }

    const createdByCol = material.created_by || material.uploaded_by;
    if (createdByCol) {
      const { data: creator } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", createdByCol)
        .single();
      creatorName = creator?.full_name || "";
    }

    sendSuccess(res, { ...material, courseName, creatorName });
  } catch {
    sendError(res, "Failed to get material", 500);
  }
}

export async function createMaterial(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { courseId, title, description, driveUrl, filePath, fileName, fileSize, mimeType } = req.body;
    const adminReq = req as AdminRequest;
    const supabase = getSupabaseClient();

    const insertData: Record<string, unknown> = {
      course_id: courseId,
      title,
      description: description || null,
      drive_url: driveUrl || null,
      file_url: filePath || driveUrl || "",
      file_type: mimeType || null,
      file_size: fileSize || null,
      file_name: fileName || null,
      created_by: adminReq.user?.id || null,
    };

    const { data, error } = await supabase
      .from("study_materials")
      .insert(insertData)
      .select("id,course_id,title,description,file_url,file_type,file_size,drive_url,file_name,created_by,uploaded_by,sort_order,created_at,updated_at")
      .single();

    if (error) {
      console.error("[admin] createMaterial Supabase error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      sendError(res, error.message, 400);
      return;
    }

    sendSuccess(res, data, 201);
  } catch (err) {
    console.error("[admin] createMaterial error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to create material", 500);
  }
}

export async function updateMaterial(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { courseId, title, description, driveUrl, filePath, fileName, fileSize, mimeType } = req.body;
    const supabase = getSupabaseClient();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (courseId !== undefined) updates.course_id = courseId;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description || null;
    if (driveUrl !== undefined) updates.drive_url = driveUrl || null;
    if (filePath !== undefined) updates.file_url = filePath || "";
    if (fileName !== undefined) updates.file_name = fileName || null;
    if (fileSize !== undefined) updates.file_size = fileSize || null;
    if (mimeType !== undefined) updates.file_type = mimeType || null;

    const { data, error } = await supabase
      .from("study_materials")
      .update(updates)
      .eq("id", id)
      .select("id,course_id,title,description,file_url,file_type,file_size,drive_url,file_name,created_by,uploaded_by,sort_order,created_at,updated_at")
      .single();

    if (error) {
      console.error("[admin] updateMaterial Supabase error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      sendError(res, error.message, 400);
      return;
    }

    sendSuccess(res, data);
  } catch (err) {
    console.error("[admin] updateMaterial error:", err instanceof Error ? err.message : err);
    sendError(res, "Failed to update material", 500);
  }
}

export async function deleteMaterial(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("study_materials")
      .delete()
      .eq("id", id);

    if (error) {
      sendError(res, error.message, 400);
      return;
    }

    sendSuccess(res, { message: "Material deleted successfully" });
  } catch {
    sendError(res, "Failed to delete material", 500);
  }
}
