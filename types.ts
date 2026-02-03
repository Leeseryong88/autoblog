
export enum BlogType {
  RESTAURANT = 'RESTAURANT',
  GENERAL = 'GENERAL'
}

export interface BlogInfo {
  type: BlogType;
  // 맛집 관련
  name?: string;
  location?: string;
  mainMenu?: string;
  // 자유 주제 관련
  subject?: string;
  category?: string;
  // 공통
  mood: string;
  specialNotes: string;
  rating: number;
  writingStyle?: string;
}

export interface WritingStyle {
  id: string;
  title: string;
  content: string;
}

export interface PhotoData {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}

export type BlogSectionType = 'text' | 'image' | 'subtitle' | 'summary';

export interface BlogSection {
  type: BlogSectionType;
  content: string;
  imageIndex?: number;
}

export interface GeneratedBlog {
  title: string;
  sections: BlogSection[];
  tags: string[];
}

export enum AppStep {
  SELECT_TYPE = 'SELECT_TYPE',
  UPLOAD = 'UPLOAD',
  INFO = 'INFO',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ADMIN = 'ADMIN'
}
