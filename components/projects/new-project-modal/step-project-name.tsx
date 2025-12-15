// components/projects/new-project-modal/step-project-name.tsx

"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepProjectNameProps {
  onSubmit: (name: string) => void;
}

export function StepProjectName({ onSubmit }: StepProjectNameProps) {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onSubmit(projectName);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!projectName.trim()}>
          Continue
        </Button>
      </div>
    </form>
  );
}
