import React, { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Subscription, useSubscriptions } from "@edifitech-graphql/index";

interface SubscriptionSelectorProps {
  companyId: string;
  subscriptions: any[];
}

const SubscriptionSelector: React.FC<SubscriptionSelectorProps> = ({ companyId, subscriptions }) => {
  const [selectedSubscription, setSelectedSubscription] = useState("");
  // Aquí puedes usar la función useMutation para actualizar la suscripción en el backend
  // const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);
  const { subscriptions: subscriptionsList, loading, error } = useSubscriptions()

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
          {subscriptionsList?.map((subscription: Subscription) => (
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