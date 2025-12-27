// Type definitions for admin summary page

export interface Upload {
  id: string;
  key: string;
  url: string;
  createdAt: Date;
}

export interface UserWithUploads {
  id: string;
  name: string;
  email: string;
  uploads: Upload[];
}
