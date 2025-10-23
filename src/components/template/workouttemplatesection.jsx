import React from "react";
import WorkoutTemplateCard from "./workouttemplatecard";

export default function WorkoutTemplatesSection({ templates, onDelete }) {
  if (!templates || templates.length === 0) return null;

  return (
    <div className="mt-3.5 space-y-4">
      {templates.map((template) => (
        <WorkoutTemplateCard
          key={template.id}
          template={template}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
