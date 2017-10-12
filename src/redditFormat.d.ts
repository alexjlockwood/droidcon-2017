export interface redditObject {
  kind: string;
  data: redditData;
}
export interface redditData {
  after: string;
  before: string;
  children: Array<redditChild>;
  modash: string;
}
export interface redditChild {
  kind: string;
  data: redditChildData;
}

export interface redditChildData {
  approved_by: any;
  archived: any;
  author: string;
  author_flair_css_class: any;
  author_flair_text: any;
  banned_by: any;
  clicked: any;
  created: number;
  created_utc: number;
  distinguished: any;
  domain: string;
  downs: number;
  edited: any;
  gilded: any;
  hidden: boolean;
  id: any;
  is_self: any;
  likes: any;
  link_flair_css_class: any;
  link_flair_text: any;
  media: any;
  media_embed: any;
  mod_reports: any;
  name: any;
  num_comments: number;
  num_reports: any;
  over_18: boolean;
  permalink: any;
  removal_reason: any;
  report_reasons: any;
  saved: any;
  score: number;
  secure_media: any;
  secure_media_embed: any;
  selftext: string;
  selftext_html: any;
  stickied: any;
  subreddit: string;
  subreddit_id: string;
  suggested_sort: any;
  thumbnail: string;
  title: string;
  ups: number;
  url: string;
  user_reports: Array<any>;
  visited: any;
}
