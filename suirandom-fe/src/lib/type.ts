export interface Winner {
  address: string;
  timestamp: number;
  name?: string;
}

export interface WinnerEvent {
  parsedJson: {
    winners: string[];
  };
}
