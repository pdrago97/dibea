import { NextRequest, NextResponse } from "next/server";

// Mock implementation - in production, this would upload to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const animalId = formData.get("animalId") as string;

    if (!file || !fileName || !animalId) {
      return NextResponse.json(
        { success: false, message: "Dados de upload incompletos" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Tipo de arquivo não suportado" },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Arquivo muito grande (máx. 5MB)" },
        { status: 400 },
      );
    }

    // In production, this would upload to Supabase Storage
    // For now, return a mock URL
    const mockUrl = `https://example.com/storage/animals/${animalId}/${fileName}`;

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      url: mockUrl,
      fileName,
      message: "Upload realizado com sucesso",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
