'use client';

import { Button } from "@heroui/react";
import { LessonData } from "@/app/hooks/neurapp/useLessons";

interface LessonInfoPanelProps {
  lesson: LessonData;
  onEdit: () => void;
}

export default function LessonInfoPanel({
  lesson,
  onEdit
}: LessonInfoPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800">
          Información de la Lección
        </h3>
        <Button
          color="primary"
          size="sm"
          onPress={onEdit}
        >
          Editar
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Título
              </th>
              {lesson.description && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Descripción
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm text-gray-800 align-top">
                {lesson.title}
              </td>
              {lesson.description && (
                <td className="px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap align-top">
                  {lesson.description}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
