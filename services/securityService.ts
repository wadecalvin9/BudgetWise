import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = 'user_pin';
const SECURITY_QUESTION_KEY = 'security_question';
const SECURITY_ANSWER_KEY = 'security_answer';
const IS_PIN_ENABLED_KEY = 'is_pin_enabled';

export const SecurityService = {
    async setPin(pin: string): Promise<void> {
        await AsyncStorage.setItem(PIN_KEY, pin);
        await AsyncStorage.setItem(IS_PIN_ENABLED_KEY, 'true');
    },

    async validatePin(pin: string): Promise<boolean> {
        const storedPin = await AsyncStorage.getItem(PIN_KEY);
        return storedPin === pin;
    },

    async isPinEnabled(): Promise<boolean> {
        const enabled = await AsyncStorage.getItem(IS_PIN_ENABLED_KEY);
        return enabled === 'true';
    },

    async disablePin(): Promise<void> {
        await AsyncStorage.setItem(IS_PIN_ENABLED_KEY, 'false');
    },

    async setSecurityQuestion(question: string, answer: string): Promise<void> {
        await AsyncStorage.setItem(SECURITY_QUESTION_KEY, question);
        await AsyncStorage.setItem(SECURITY_ANSWER_KEY, answer.toLowerCase().trim());
    },

    async getSecurityQuestion(): Promise<string | null> {
        return await AsyncStorage.getItem(SECURITY_QUESTION_KEY);
    },

    async validateSecurityAnswer(answer: string): Promise<boolean> {
        const storedAnswer = await AsyncStorage.getItem(SECURITY_ANSWER_KEY);
        return storedAnswer === answer.toLowerCase().trim();
    },

    async hasSecuritySetup(): Promise<boolean> {
        const pin = await AsyncStorage.getItem(PIN_KEY);
        const question = await AsyncStorage.getItem(SECURITY_QUESTION_KEY);
        return !!(pin && question);
    }
};
