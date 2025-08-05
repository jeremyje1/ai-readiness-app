// prisma/schema.prisma
// Generated from DATA_MODEL.md – June 18 2025

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Defined per‑environment (Neon)
}

generator client {
  provider = "prisma-client-js"
}

model Organization {
  id              String            @id @default(uuid())
  name            String
  mission         String
  units           Unit[]
  strategicPillars StrategicPillar[]

  @@map("organizations")
}

model Unit {
  id              String                @id @default(uuid())
  organizationId  String
  name            String
  parentUnitId    String?               @map("parent_unit_id")

  // ─── Relations ──────────────────────────────────────────────────────────────
  organization    Organization          @relation(fields: [organizationId], references: [id])
  parent          Unit?                 @relation("UnitToParent", fields: [parentUnitId], references: [id])
  children        Unit[]                @relation("UnitToParent")
  positions       Position[]
  strategicLinks  UnitStrategicPillar[]

  // Example query:
  // Find all child units for a given unit
  // SELECT * FROM units WHERE parent_unit_id = '<unit_id>';

  // Example mutation:
  // Add a new child unit
  // INSERT INTO units (organization_id, name, parent_unit_id) VALUES (...);

  @@map("units")
}

model Position {
  id       String  @id @default(uuid())
  unitId   String
  title    String
  FTE      Int
  personId String?

  // Relations
  unit     Unit    @relation(fields: [unitId], references: [id])
  person   Person? @relation(fields: [personId], references: [id])

  // Example query:
  // Find all positions in a unit
  // SELECT * FROM positions WHERE unit_id = '<unit_id>';

  // Example mutation:
  // Assign a person to a position
  // UPDATE positions SET person_id = '<person_id>' WHERE id = '<position_id>';

  @@map("positions")
}

model Person {
  id        String     @id @default(uuid())
  firstName String
  lastName  String
  email     String     @unique
  positions Position[]

  @@map("people")
}

model StrategicPillar {
  id              String                @id @default(uuid())
  organizationId  String
  name            String
  description     String
  kpis            KPI[]
  unitLinks       UnitStrategicPillar[]

  // Relations
  organization    Organization          @relation(fields: [organizationId], references: [id])

  @@map("strategic_pillars")
}

model KPI {
  id        String          @id @default(uuid())
  pillarId  String
  metric    String
  target    Float

  // Relations
  pillar    StrategicPillar @relation(fields: [pillarId], references: [id])

  @@map("kpis")
}

model UnitStrategicPillar {
  unitId   String
  pillarId String

  // Relations
  unit     Unit            @relation(fields: [unitId], references: [id])
  pillar   StrategicPillar @relation(fields: [pillarId], references: [id])

  @@id([unitId, pillarId])
  @@map("units_strategic_pillars")
}
