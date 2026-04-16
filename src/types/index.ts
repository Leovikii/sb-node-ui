export interface GithubConfig {
  owner: string;
  repo: string;
  pat: string;
}

export interface Rule {
  group: string;
  include: string;
  exclude: string;
}

export interface InboundRule {
  include: string;
  exclude: string;
}

export interface Profile {
  name: string;
  templateUrl: string;
  inboundsPath: string;
  outboundsPath: string;
  rules: Rule[];
  inboundRules: InboundRule[];
}

export interface StateData {
  profiles: Profile[];
}