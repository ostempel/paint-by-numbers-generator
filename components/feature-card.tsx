import React from "react";
import { Card } from "./ui/card";

interface FeatureCardProps {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
}

export default function FeatureCard({
  title,
  description,
  icon,
}: FeatureCardProps) {
  return (
    <Card className="p-6 shadow-sm">
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Card>
  );
}
