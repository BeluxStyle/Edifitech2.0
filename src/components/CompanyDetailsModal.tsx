import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import UserManagement from "./UserManagement";
import CommunityManagement from "./CommunityManagement";
import SubscriptionSelector from "./SubscriptionSelector";

interface CompanyDetailsModalProps {
  open: boolean;
  company: any;
  onClose: () => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ open, company, onClose }) => {
  if (!company) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{company.name}</DialogTitle>
      <DialogContent>
        {/* Usuarios */}
        <UserManagement companyId={company.id} users={company.users || []} />
        {/* Comunidades */}
        <CommunityManagement companyId={company.id} communities={company.comunidades || []} />
        {/* Suscripciones */}
        <SubscriptionSelector companyId={company.id} subscriptions={company.companySubscriptions || []} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyDetailsModal;