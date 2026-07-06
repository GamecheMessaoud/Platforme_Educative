export interface VerificationCriteria {
    id: string;
    text: string;
    met?: boolean;
}

export interface VerificationResult {
    isCorrect: boolean;
    criteria: VerificationCriteria[];
    feedback: string;
    reward?: number;
    suggestions?: string[];
}

export interface NotificationMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}
