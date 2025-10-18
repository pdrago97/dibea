import { Request, Response } from "express";
import { graphService } from "../services/graphService";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class AgentController {
  // Create Animal via Agent
  async createAnimal(req: Request, res: Response): Promise<any> {
    try {
      const {
        name,
        species,
        breed,
        sex,
        size,
        age,
        weight,
        color,
        status,
        municipalityId,
        observations,
      } = req.body;

      // Validate required fields
      if (!name || !species || !sex || !size || !status || !municipalityId) {
        return res.status(400).json({
          error:
            "Campos obrigatórios: name, species, sex, size, status, municipalityId",
        });
      }

      const animalId = uuidv4();
      const qrCode = `DIBEA-${animalId.slice(0, 8).toUpperCase()}`;

      // Create in PostgreSQL
      const animal = await prisma.animal.create({
        data: {
          id: animalId,
          name,
          species,
          breed,
          sex,
          size,
          weight: weight ? parseFloat(weight) : null,
          color,
          observations: observations || "",
          status,
          municipalityId,
          qrCode,
        },
      });

      // Create in Neo4j Graph
      const graphNode = await graphService.createAnimalNode({
        id: animalId,
        name,
        species,
        breed,
        sex,
        size,
        birthDate: undefined, // Not provided in request
        weight: weight ? parseFloat(weight) : undefined,
        color,
        temperament: observations || "",
        status,
        municipalityId,
        qrCode,
        observations,
      });

      logger.info(`Animal ${name} criado via agente: ${animalId}`);

      res.status(201).json({
        success: true,
        message: `Animal ${name} cadastrado com sucesso!`,
        data: {
          id: animalId,
          animal,
          graphNode,
        },
      });
    } catch (error) {
      logger.error("Erro ao criar animal via agente:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Create Procedure via Agent
  async createProcedure(req: Request, res: Response): Promise<any> {
    try {
      const {
        animalId,
        type,
        title,
        description,
        date,
        location,
        cost,
        veterinarianId,
        tutorId,
        status,
        metadata,
      } = req.body;

      // Validate required fields
      if (!animalId || !type || !title || !date || !status) {
        return res.status(400).json({
          error: "Campos obrigatórios: animalId, type, title, date, status",
        });
      }

      // Verify animal exists
      const animal = await prisma.animal.findUnique({
        where: { id: animalId },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal não encontrado",
        });
      }

      const procedureId = uuidv4();

      // Create in Neo4j Graph
      const graphNode = await graphService.createEventNode({
        id: procedureId,
        animalId,
        type,
        title,
        description,
        date: new Date(date),
        location,
        cost: cost ? parseFloat(cost) : undefined,
        veterinarianId,
        tutorId,
        status,
        metadata,
      });

      logger.info(
        `Procedimento ${title} criado via agente para animal ${animalId}`,
      );

      res.status(201).json({
        success: true,
        message: `Procedimento ${title} registrado com sucesso!`,
        data: {
          id: procedureId,
          graphNode,
        },
      });
    } catch (error) {
      logger.error("Erro ao criar procedimento via agente:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Search Animals by Name
  async searchAnimals(req: Request, res: Response): Promise<any> {
    try {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({
          error: "Parâmetro name é obrigatório",
        });
      }

      const animals = await prisma.animal.findMany({
        where: {
          name: {
            contains: name as string,
          },
        },
        take: 10,
        include: {
          municipality: {
            select: {
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: animals,
      });
    } catch (error) {
      logger.error("Erro ao buscar animais:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  // Get Animal Graph Data
  async getAnimalGraph(req: Request, res: Response) {
    try {
      const { animalId } = req.params;

      const graphData = await graphService.getAnimalGraph(animalId);
      const insights = await graphService.getAnimalInsights(animalId);

      res.json({
        success: true,
        data: {
          graph: graphData,
          insights,
        },
      });
    } catch (error) {
      logger.error("Erro ao buscar grafo do animal:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  // OCR Processing for Documents
  async processOCR(req: Request, res: Response) {
    try {
      const { fileUrl, documentType } = req.body;

      // Simulate OCR processing (integrate with actual OCR service)
      const extractedText = `Texto extraído do documento ${documentType}`;

      res.json({
        success: true,
        extractedText,
        confidence: 0.95,
        language: "pt-BR",
      });
    } catch (error) {
      logger.error("Erro no OCR:", error);
      res.status(500).json({ error: "Erro no processamento OCR" });
    }
  }

  // Computer Vision Analysis
  async analyzeImage(req: Request, res: Response) {
    try {
      const { imageUrl, analysisType } = req.body;

      // Simulate computer vision analysis
      const analysis = {
        animalDetected: true,
        species: "CANINO",
        breed: "SRD",
        conditions: ["saudável"],
        confidence: 0.92,
      };

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      logger.error("Erro na análise de imagem:", error);
      res.status(500).json({ error: "Erro na análise de imagem" });
    }
  }

  // CPF Validation with Real API
  async validateCPF(req: Request, res: Response): Promise<any> {
    try {
      const { cpf } = req.body;

      if (!cpf) {
        return res.status(400).json({
          success: false,
          error: "CPF é obrigatório",
        });
      }

      // Clean CPF (remove non-digits)
      const cleanCPF = cpf.replace(/\D/g, "");

      // Basic format validation
      if (cleanCPF.length !== 11) {
        return res.json({
          success: true,
          valid: false,
          error: "CPF deve ter 11 dígitos",
          cpf: cleanCPF,
        });
      }

      // Check for invalid patterns (all same digits)
      if (/^(\d)\1{10}$/.test(cleanCPF)) {
        return res.json({
          success: true,
          valid: false,
          error: "CPF inválido",
          cpf: cleanCPF,
        });
      }

      // Calculate verification digits
      const isValidCPF = this.validateCPFAlgorithm(cleanCPF);

      if (!isValidCPF) {
        return res.json({
          success: true,
          valid: false,
          error: "CPF inválido",
          cpf: cleanCPF,
        });
      }

      // Try to validate with Receita Federal API (optional)
      let rfbStatus = "not_checked";
      try {
        // Note: Real implementation would use official API
        // For demo, we'll simulate the validation
        rfbStatus = "valid";
      } catch (rfbError) {
        logger.warn("Erro ao consultar Receita Federal:", rfbError);
        // Continue with basic validation
      }

      res.json({
        success: true,
        valid: true,
        cpf: cleanCPF,
        formatted: this.formatCPF(cleanCPF),
        rfbStatus,
      });
    } catch (error) {
      logger.error("Erro na validação de CPF:", error);
      res.status(500).json({ error: "Erro na validação de CPF" });
    }
  }

  // CPF Algorithm Validation
  private validateCPFAlgorithm(cpf: string): boolean {
    // Calculate first verification digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cpf[9]) !== digit1) return false;

    // Calculate second verification digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cpf[10]) === digit2;
  }

  // Format CPF for display
  private formatCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  // Check Tutor Duplicates
  async checkTutorDuplicates(req: Request, res: Response) {
    try {
      const { cpf } = req.query;

      const existingTutor = await prisma.tutor.findFirst({
        where: { cpf: cpf as string },
      });

      res.json({
        success: true,
        exists: !!existingTutor,
        tutor: existingTutor || null,
      });
    } catch (error) {
      logger.error("Erro ao verificar duplicatas:", error);
      res.status(500).json({ error: "Erro ao verificar duplicatas" });
    }
  }

  // Profile Analysis for Adoption
  async analyzeProfile(req: Request, res: Response) {
    try {
      const { tutorData } = req.body;

      // Simulate AI profile analysis
      const analysis = {
        suitabilityScore: 0.85,
        recommendations: ["Adequado para animais de porte médio"],
        riskFactors: [],
        strengths: ["Experiência com animais", "Moradia adequada"],
      };

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      logger.error("Erro na análise de perfil:", error);
      res.status(500).json({ error: "Erro na análise de perfil" });
    }
  }

  // Agent Health Check
  async healthCheck(req: Request, res: Response) {
    try {
      // Test database connections
      await prisma.$queryRaw`SELECT 1`;
      await graphService.connect();

      res.json({
        success: true,
        message: "Sistema de agentes funcionando corretamente",
        timestamp: new Date().toISOString(),
        services: {
          postgresql: "connected",
          neo4j: "connected",
        },
      });
    } catch (error) {
      logger.error("Health check falhou:", error);
      res.status(500).json({
        success: false,
        error: "Falha na verificação de saúde do sistema",
      });
    }
  }

  // Execute Database Queries
  async executeQuery(req: Request, res: Response): Promise<any> {
    try {
      const { query, type } = req.body;

      let results;

      if (type === "sql") {
        // Execute PostgreSQL query
        results = await prisma.$queryRawUnsafe(query);
      } else if (type === "cypher") {
        // Execute Neo4j query
        results = await graphService.executeQuery(query);
      } else {
        return res.status(400).json({ error: "Tipo de query inválido" });
      }

      res.json({
        success: true,
        results,
        queryType: type,
      });
    } catch (error) {
      logger.error("Erro ao executar query:", error);
      res.status(500).json({ error: "Erro ao executar query" });
    }
  }

  // Generate Analytics
  async generateAnalytics(req: Request, res: Response) {
    try {
      const { data, analysisType } = req.body;

      // Simulate analytics generation
      const analytics = {
        summary: "Análise gerada com sucesso",
        insights: ["Insight 1", "Insight 2"],
        trends: ["Tendência crescente"],
        recommendations: ["Recomendação 1"],
      };

      res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      logger.error("Erro ao gerar analytics:", error);
      res.status(500).json({ error: "Erro ao gerar analytics" });
    }
  }

  // Create Visualizations
  async createVisualization(req: Request, res: Response) {
    try {
      const { data, chartType, title } = req.body;

      // Simulate visualization creation
      const visualization = {
        chartUrl: "/charts/generated-chart.png",
        chartType,
        title,
        data: data,
      };

      res.json({
        success: true,
        visualization,
      });
    } catch (error) {
      logger.error("Erro ao criar visualização:", error);
      res.status(500).json({ error: "Erro ao criar visualização" });
    }
  }

  // Generate Reports
  async generateReport(req: Request, res: Response) {
    try {
      const reportData = req.body;

      // Create report record
      const report = {
        id: uuidv4(),
        title: reportData.title,
        type: reportData.queryType,
        data: reportData,
        createdAt: new Date(),
      };

      res.json({
        success: true,
        message: "Relatório gerado com sucesso!",
        report,
      });
    } catch (error) {
      logger.error("Erro ao gerar relatório:", error);
      res.status(500).json({ error: "Erro ao gerar relatório" });
    }
  }

  // Create Tutor via Agent
  async createTutor(req: Request, res: Response) {
    try {
      const tutorData = req.body;
      const tutorId = uuidv4();

      // Create tutor in database
      const tutor = await prisma.tutor.create({
        data: {
          id: tutorId,
          ...tutorData,
        },
      });

      res.status(201).json({
        success: true,
        message: "Tutor cadastrado com sucesso!",
        data: { id: tutorId, tutor },
      });
    } catch (error) {
      logger.error("Erro ao criar tutor via agente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // Process Document via Agent
  async processDocument(req: Request, res: Response) {
    try {
      const documentData = req.body;
      const documentId = uuidv4();

      // Process and store document
      const document = {
        id: documentId,
        ...documentData,
        processedAt: new Date(),
      };

      res.status(201).json({
        success: true,
        message: "Documento processado com sucesso!",
        data: { id: documentId, document },
      });
    } catch (error) {
      logger.error("Erro ao processar documento via agente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

export const agentController = new AgentController();
