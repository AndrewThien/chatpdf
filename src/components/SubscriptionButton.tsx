"use client";
import React from "react";
import { Button } from "./ui/button";
import axios from "axios";
import {Sparkles} from "lucide-react"

type Props = { isPro: boolean };

const SubscriptionButton = (props: Props) => {
  const [loading, setLoading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return ( 
    <Button className="ml-2" disabled={loading} onClick={handleSubscription} >
      {props.isPro ? "Manage Subscriptions" : "Get Pro"} <Sparkles className="ml-2" />
    </Button>
  );
};

export default SubscriptionButton;