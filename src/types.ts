export type PipelineStage = 'new' | 'contacted' | 'discussion' | 'proposal' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  website: string;
  address: string;
  phone: string;
  category: string;
  rating: number | null;
  reviewsCount: number;
  email: string;
  socials: string;
  score: number;
  scoreExplanation: string;
  stage: PipelineStage;
  createdAt: string;
  updatedAt: string;
  notes: string;
  personalization?: {
    emailSubject: string;
    emailBody: string;
    whatsappMessage: string;
  } | null;
  crmSyncStatus?: {
    synced: boolean;
    crmType: 'hubspot' | 'salesforce';
    syncedAt: string;
    externalId?: string;
    enrichedData?: Record<string, any>;
  } | null;
  sequenceEnrollment?: {
    sequenceId: string;
    currentStepIndex: number;
    startDate: string;
    abVariant: 'A' | 'B';
    history: {
      stepIndex: number;
      sentAt: string;
      channel: 'email' | 'whatsapp';
      variantUsed: 'A' | 'B';
      status: 'sent' | 'bounced' | 'clicked' | 'replied';
    }[];
  } | null;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  dueDate: string;
  notes: string;
  completed: boolean;
  createdAt: string;
}

export interface AgencyConfig {
  name: string;
  services: string;
  pitch: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface SearchLeadsRequest {
  query: string;
  location?: string;
  agencyConfig?: AgencyConfig;
}

export interface SearchLeadsResponse {
  leads: Partial<Lead>[];
}

export interface PersonalizeRequest {
  lead: Lead;
  agencyConfig: AgencyConfig;
}

export interface PersonalizeResponse {
  emailSubject: string;
  emailBody: string;
  whatsappMessage: string;
}
