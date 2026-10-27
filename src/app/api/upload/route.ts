import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để tải lên tệp" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy tệp để tải lên" }, { status: 400 });
    }

    const mimeType = file.type;
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Định dạng không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WEBP) hoặc video (MP4, WEBM)" }, { status: 400 });
    }

    // Giới hạn dung lượng: 20MB cho ảnh, 60MB cho video
    const maxBytes = isVideo ? 60 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxBytes) {
      const maxMb = maxBytes / (1024 * 1024);
      return NextResponse.json({ error: `Tệp quá lớn. Giới hạn tối đa là ${maxMb}MB` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên tệp an toàn và ngẫu nhiên
    const extension = path.extname(file.name) || (isImage ? ".jpg" : ".mp4");
    const uniqueId = crypto.randomUUID();
    const cleanFileName = `${Date.now()}-${uniqueId}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, cleanFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${cleanFileName}`;
    const fileType = isVideo ? "VIDEO" : "IMAGE";

    return NextResponse.json({
      success: true,
      fileUrl,
      thumbnailUrl: fileUrl,
      fileType,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Không thể lưu tệp trên máy chủ. Vui lòng thử lại." }, { status: 500 });
  }
}
