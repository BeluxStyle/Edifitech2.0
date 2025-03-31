import React, { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SUBSCRIPTIONS } from "../graphql/queries";

interface SubscriptionSelectorProps {
  companyId: string;
  subscriptions: any[];
}

const SubscriptionSelector: React.FC<SubscriptionSelectorProps> = ({ companyId, subscriptions }) => {
  const [selectedSubscription, setSelectedSubscription] = useState("");
  // Aquí puedes usar la función useMutation para actualizar la suscripción en el backend
  // const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);
  const { data, loading, error } = useQuery(GET_SUBSCRIPTIONS);

  const handleChange = (event: any) => {
    setSelectedSubscription(event.target.value);
    
    // Aquí puedes agregar lógica para actualizar la suscripción en el backend
  };

  return (
    <>
      <h3>Suscripciones</h3>
      <FormControl fullWidth>
        <InputLabel>Suscripción</InputLabel>
        <Select value={selectedSubscription} onChange={handleChange} label="Suscripción">
          {data?.subscriptions?.map((subscription) => (
            <MenuItem key={subscription.id} value={subscription.id}>
              {subscription?.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default SubscriptionSelector;