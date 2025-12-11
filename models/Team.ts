import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember {
  name: string;
  contactNumber: string;
  email: string;
  usn?: string;
}

export interface ITeam extends Document {
  teamId: string;
  teamSize: number;
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    usn: { type: String, required: false },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    teamId: { type: String, required: true, unique: true, index: true },
    teamSize: { type: Number, required: true, min: 2, max: 4 },
    members: { type: [TeamMemberSchema], required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent model re-compilation during development
const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;

