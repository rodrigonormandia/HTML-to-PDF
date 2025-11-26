import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import ptBrTranslation from './locales/pt-br/translation.json';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            'pt-BR': {
                translation: ptBrTranslation
            }
        },
        fallbackLng: 'pt-BR',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['querystring', 'navigator'],
            lookupQuerystring: 'lang',
        }
    });

export default i18n;
