import neo4j, { Driver, Session, Result } from 'neo4j-driver';
import { logger } from '../utils/logger';

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, any>;
}

export interface GraphQuery {
  query: string;
  parameters?: Record<string, any>;
}

class GraphService {
  private driver: Driver;
  private uri: string;
  private username: string;
  private password: string;

  constructor() {
    this.uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    this.username = process.env.NEO4J_USERNAME || 'neo4j';
    this.password = process.env.NEO4J_PASSWORD || 'dibea123';
    
    this.driver = neo4j.driver(
      this.uri,
      neo4j.auth.basic(this.username, this.password),
      {
        disableLosslessIntegers: true,
        logging: {
          level: 'info',
          logger: (level, message) => logger.info(`Neo4j ${level}: ${message}`)
        }
      }
    );
  }

  async connect(): Promise<void> {
    try {
      await this.driver.verifyConnectivity();
      logger.info('✅ Connected to Neo4j database');
    } catch (error) {
      logger.error('❌ Failed to connect to Neo4j:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.driver.close();
    logger.info('🔌 Disconnected from Neo4j database');
  }

  private async executeQuery(query: string, parameters: Record<string, any> = {}): Promise<Result> {
    const session: Session = this.driver.session();
    try {
      const result = await session.run(query, parameters);
      return result;
    } finally {
      await session.close();
    }
  }

  // Create Animal Node with rich properties
  async createAnimalNode(animalData: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    sex: string;
    size: string;
    birthDate?: Date;
    weight?: number;
    color?: string;
    temperament?: string;
    status: string;
    municipalityId: string;
    qrCode: string;
    observations?: string;
  }): Promise<GraphNode> {
    const query = `
      CREATE (a:Animal {
        id: $id,
        name: $name,
        species: $species,
        breed: $breed,
        sex: $sex,
        size: $size,
        birthDate: $birthDate,
        weight: $weight,
        color: $color,
        temperament: $temperament,
        status: $status,
        municipalityId: $municipalityId,
        qrCode: $qrCode,
        observations: $observations,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN a
    `;

    const result = await this.executeQuery(query, animalData);
    const record = result.records[0];
    const node = record.get('a');

    return {
      id: node.properties.id,
      labels: node.labels,
      properties: node.properties
    };
  }

  // Create Document Node
  async createDocumentNode(documentData: {
    id: string;
    animalId: string;
    type: 'photo' | 'medical_report' | 'prescription' | 'invoice' | 'certificate';
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
    extractedText?: string;
    analysisResults?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<GraphNode> {
    const query = `
      MATCH (a:Animal {id: $animalId})
      CREATE (d:Document {
        id: $id,
        type: $type,
        fileName: $fileName,
        fileUrl: $fileUrl,
        mimeType: $mimeType,
        size: $size,
        extractedText: $extractedText,
        analysisResults: $analysisResults,
        metadata: $metadata,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (a)-[:HAS_DOCUMENT]->(d)
      RETURN d
    `;

    const result = await this.executeQuery(query, documentData);
    const record = result.records[0];
    const node = record.get('d');

    return {
      id: node.properties.id,
      labels: node.labels,
      properties: node.properties
    };
  }

  // Create Event Node (procedures, adoptions, rescues, etc.)
  async createEventNode(eventData: {
    id: string;
    animalId: string;
    type: 'rescue' | 'medical_procedure' | 'adoption' | 'vaccination' | 'surgery' | 'checkup';
    title: string;
    description?: string;
    date: Date;
    location?: string;
    cost?: number;
    veterinarianId?: string;
    tutorId?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    metadata?: Record<string, any>;
  }): Promise<GraphNode> {
    const query = `
      MATCH (a:Animal {id: $animalId})
      CREATE (e:Event {
        id: $id,
        type: $type,
        title: $title,
        description: $description,
        date: $date,
        location: $location,
        cost: $cost,
        veterinarianId: $veterinarianId,
        tutorId: $tutorId,
        status: $status,
        metadata: $metadata,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (a)-[:PARTICIPATED_IN]->(e)
      RETURN e
    `;

    const result = await this.executeQuery(query, eventData);
    const record = result.records[0];
    const node = record.get('e');

    return {
      id: node.properties.id,
      labels: node.labels,
      properties: node.properties
    };
  }

  // Create relationships between entities
  async createRelationship(
    fromNodeId: string,
    toNodeId: string,
    relationshipType: string,
    properties: Record<string, any> = {}
  ): Promise<GraphRelationship> {
    const query = `
      MATCH (from), (to)
      WHERE from.id = $fromNodeId AND to.id = $toNodeId
      CREATE (from)-[r:${relationshipType} $properties]->(to)
      RETURN r, id(from) as fromId, id(to) as toId
    `;

    const result = await this.executeQuery(query, { fromNodeId, toNodeId, ...properties });
    const record = result.records[0];
    const relationship = record.get('r');

    return {
      id: relationship.identity.toString(),
      type: relationship.type,
      startNodeId: record.get('fromId').toString(),
      endNodeId: record.get('toId').toString(),
      properties: relationship.properties
    };
  }

  // Get animal's complete graph (all related nodes and relationships)
  async getAnimalGraph(animalId: string): Promise<{
    nodes: GraphNode[];
    relationships: GraphRelationship[];
  }> {
    const query = `
      MATCH (a:Animal {id: $animalId})
      OPTIONAL MATCH (a)-[r1]-(connected)
      OPTIONAL MATCH (connected)-[r2]-(secondLevel)
      WHERE secondLevel <> a
      RETURN a, connected, secondLevel, r1, r2
    `;

    const result = await this.executeQuery(query, { animalId });
    const nodes: GraphNode[] = [];
    const relationships: GraphRelationship[] = [];
    const nodeIds = new Set<string>();
    const relationshipIds = new Set<string>();

    result.records.forEach(record => {
      // Process nodes
      ['a', 'connected', 'secondLevel'].forEach(nodeKey => {
        const node = record.get(nodeKey);
        if (node && !nodeIds.has(node.properties.id)) {
          nodes.push({
            id: node.properties.id,
            labels: node.labels,
            properties: node.properties
          });
          nodeIds.add(node.properties.id);
        }
      });

      // Process relationships
      ['r1', 'r2'].forEach(relKey => {
        const rel = record.get(relKey);
        if (rel && !relationshipIds.has(rel.identity.toString())) {
          relationships.push({
            id: rel.identity.toString(),
            type: rel.type,
            startNodeId: rel.start.toString(),
            endNodeId: rel.end.toString(),
            properties: rel.properties
          });
          relationshipIds.add(rel.identity.toString());
        }
      });
    });

    return { nodes, relationships };
  }

  // Search for patterns in the graph
  async searchPatterns(query: GraphQuery): Promise<any[]> {
    const result = await this.executeQuery(query.query, query.parameters);
    return result.records.map(record => record.toObject());
  }

  // Get insights and analytics
  async getAnimalInsights(animalId: string): Promise<{
    totalDocuments: number;
    totalEvents: number;
    totalCosts: number;
    lastEvent?: any;
    healthStatus?: string;
  }> {
    const query = `
      MATCH (a:Animal {id: $animalId})
      OPTIONAL MATCH (a)-[:HAS_DOCUMENT]->(d:Document)
      OPTIONAL MATCH (a)-[:PARTICIPATED_IN]->(e:Event)
      RETURN 
        count(DISTINCT d) as totalDocuments,
        count(DISTINCT e) as totalEvents,
        sum(e.cost) as totalCosts,
        max(e.date) as lastEventDate
    `;

    const result = await this.executeQuery(query, { animalId });
    const record = result.records[0];

    return {
      totalDocuments: record.get('totalDocuments').toNumber(),
      totalEvents: record.get('totalEvents').toNumber(),
      totalCosts: record.get('totalCosts') || 0,
      lastEvent: record.get('lastEventDate')
    };
  }
}

export const graphService = new GraphService();
