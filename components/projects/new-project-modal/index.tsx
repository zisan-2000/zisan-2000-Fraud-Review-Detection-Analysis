// components/projects/new-project-modal/index.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StepProjectName } from "./step-project-name";
import { StepSearchBusiness } from "./step-search-business";
import { StepConfirmBusiness } from "./step-confirm-business";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  const handleClose = () => {
    setStep(1);
    setProjectName("");
    setSelectedBusiness(null);
    onClose();
  };

  const handleProjectNameSubmit = (name: string) => {
    setProjectName(name);
    setStep(2);
  };

  const handleBusinessSelect = (business: any) => {
    setSelectedBusiness(business);
    setStep(3);
  };

  const handleConfirm = () => {
    const newProject = {
      id: Date.now().toString(),
      name: projectName,
      business: selectedBusiness.name,
      status: "In Progress",
      lastScan: "Just now",
      totalReviews: selectedBusiness.reviewCount,
      address: selectedBusiness.address,
      phone: selectedBusiness.phone,
      rating: selectedBusiness.rating,
      cid: selectedBusiness.cid,
    };
    onProjectCreated(newProject);
    handleClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Create New Project";
      case 2:
        return "Search for Business";
      case 3:
        return "Confirm Business Details";
      default:
        return "Create New Project";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{getStepTitle()}</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            <div
              className={`h-2 rounded-full flex-1 ${
                step >= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 rounded-full flex-1 ${
                step >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 rounded-full flex-1 ${
                step >= 3 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        </DialogHeader>

        <div className="mt-6">
          {step === 1 && <StepProjectName onSubmit={handleProjectNameSubmit} />}
          {step === 2 && (
            <StepSearchBusiness
              onSelect={handleBusinessSelect}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && selectedBusiness && (
            <StepConfirmBusiness
              business={selectedBusiness}
              onConfirm={handleConfirm}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
