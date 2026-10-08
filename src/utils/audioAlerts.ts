class ClinicalAudioEngine {
  public setMuted(muted: boolean) {}
  public getMuted(): boolean { return true; }
  public playEmergencyAlarm() {}
  public playHeartbeatBlip() {}
  public playConfirmChime() {}
  public playCriticalWarningTone() {}
  public speakClinicalBrief(text: string) {}
}
export const clinicalAudio = new ClinicalAudioEngine();