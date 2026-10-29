export interface Device {
  readonly viewport: { readonly width: number; readonly height: number };
  readonly deviceScaleFactor: number;
  readonly isMobile: boolean;
  readonly hasTouch: boolean;
}
export type DeviceName = "desk27" | "laptop14" | "phone";
export declare const desk27: Device;
export declare const laptop14: Device;
export declare const phone: Device;
export declare const devices: Readonly<Record<DeviceName, Device>>;
export declare const playwrightProjects: ReadonlyArray<{ readonly name: DeviceName; readonly use: Device }>;
