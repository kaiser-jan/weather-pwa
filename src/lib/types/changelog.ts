export interface Changelog {
  releases: Release[]
}

export interface Release {
  version: string
  date: string // ISO YYYY-MM-DD
  commitGroups: CommitGroup[]
}

export interface CommitGroup {
  title: string
  type: string
  commits: Commit[]
}

export interface Commit {
  hash: string
  subject: string
  scope: string
  commitUrl: string
}
