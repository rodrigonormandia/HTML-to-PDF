import { useTranslation } from 'react-i18next';
import type { Template } from './templates';

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-5 flex flex-col hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer group"
      onClick={() => onSelect(template)}
    >
      <div className="text-4xl mb-3">{template.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {t(template.nameKey)}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow">
        {t(template.descriptionKey)}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(template);
        }}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium hover:scale-105 active:scale-95"
      >
        {t('templates.btn_use')}
      </button>
    </div>
  );
}
