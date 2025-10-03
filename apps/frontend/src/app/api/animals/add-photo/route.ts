import { NextRequest, NextResponse } from "next/server";
import { AnimalService } from "@/services/animalService";

export async function POST(request: NextRequest) {
  try {
    const { animalId, photoUrl } = await request.json();

    if (!animalId || !photoUrl) {
      return NextResponse.json(
        { success: false, message: "animalId e photoUrl são obrigatórios" },
        { status: 400 },
      );
    }

    // Add photo to animal
    await AnimalService.addAnimalPhoto(animalId, photoUrl);

    return NextResponse.json({
      success: true,
      message: "Foto adicionada com sucesso",
    });
  } catch (error) {
    console.error("Error adding photo to animal:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
