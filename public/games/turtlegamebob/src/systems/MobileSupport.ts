/**
 * MobileSupport - Complete mobile experience optimization
 * Provides touch controls, responsive UI, and mobile-specific optimizations
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';

export interface TouchControlConfig {
  joystickSize: number;
  joystickAlpha: number;
  buttonSize: number;
  buttonAlpha: number;
  deadZone: number;
  maxDistance: number;
  hapticFeedback: boolean;
  showVisuals: boolean;
}

export interface MobileUIConfig {
  scaleFactor: number;
  fontSize: number;
  buttonSpacing: number;
  marginSize: number;
  adaptiveLayout: boolean;
  hideDesktopUI: boolean;
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  accelerometerSupport: boolean;
  batteryAPI: boolean;
}

export interface TouchZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rectangle' | 'circle';
  action: string;
  visual?: Phaser.GameObjects.GameObject;
  active: boolean;
}

export class MobileSupport {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Device detection
  private deviceInfo: DeviceInfo;
  
  // Touch controls
  private virtualJoystick?: VirtualJoystick;
  private touchButtons: Map<string, TouchButton> = new Map();
  private touchZones: Map<string, TouchZone> = new Map();
  private activeTouches: Map<number, TouchInput> = new Map();
  
  // Configuration
  private touchConfig: TouchControlConfig;
  private uiConfig: MobileUIConfig;
  
  // UI scaling and layout
  private uiContainer?: Phaser.GameObjects.Container;
  private safeArea: { top: number; bottom: number; left: number; right: number };
  
  // Performance optimizations
  private mobileOptimizations: {
    reducedParticles: boolean;
    simplifiedShaders: boolean;
    lowerTextureQuality: boolean;
    reducedAudioChannels: boolean;
  };
  
  // Haptic feedback
  private hapticSupported: boolean = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Detect device capabilities
    this.deviceInfo = this.detectDevice();
    
    // Initialize configurations
    this.touchConfig = {
      joystickSize: this.deviceInfo.isMobile ? 80 : 100,
      joystickAlpha: 0.7,
      buttonSize: this.deviceInfo.isMobile ? 60 : 80,
      buttonAlpha: 0.8,
      deadZone: 0.1,
      maxDistance: this.deviceInfo.isMobile ? 40 : 50,
      hapticFeedback: true,
      showVisuals: true
    };
    
    this.uiConfig = {
      scaleFactor: this.calculateUIScale(),
      fontSize: this.deviceInfo.isMobile ? 12 : 16,
      buttonSpacing: this.deviceInfo.isMobile ? 10 : 15,
      marginSize: this.deviceInfo.isMobile ? 20 : 30,
      adaptiveLayout: true,
      hideDesktopUI: this.deviceInfo.isMobile
    };
    
    // Initialize safe area (for notched devices)
    this.safeArea = this.calculateSafeArea();
    
    // Mobile performance optimizations
    this.mobileOptimizations = {
      reducedParticles: this.deviceInfo.isMobile,
      simplifiedShaders: this.deviceInfo.isMobile,
      lowerTextureQuality: this.deviceInfo.isMobile,
      reducedAudioChannels: this.deviceInfo.isMobile
    };
    
    // Check haptic support
    this.hapticSupported = 'vibrate' in navigator;
    
    if (this.deviceInfo.isMobile) {
      this.initializeMobileControls();
      this.setupMobileOptimizations();
      this.setupOrientationHandling();
    }
    
    console.log('📱 MobileSupport initialized', this.deviceInfo);
  }
  
  /**
   * Initialize mobile support with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    
    if (this.deviceInfo.isMobile && this.virtualJoystick) {
      this.virtualJoystick.setTarget(hero);
    }
    
    console.log('📱 Mobile support connected to hero');
  }
  
  /**
   * Update mobile support systems
   */
  public update(time: number, delta: number): void {
    if (this.virtualJoystick) {
      this.virtualJoystick.update(delta);
    }
    
    this.updateTouchButtons(time, delta);
    this.handleBatteryOptimizations();
    this.updateUILayout();
  }
  
  /**
   * Handle touch start event
   */
  public onTouchStart(pointer: Phaser.Input.Pointer): void {
    const touchInput: TouchInput = {
      id: pointer.id,
      x: pointer.x,
      y: pointer.y,
      startX: pointer.x,
      startY: pointer.y,
      startTime: Date.now(),
      isJoystick: false,
      isButton: false,
      zone: null
    };
    
    // Check virtual joystick
    if (this.virtualJoystick && this.virtualJoystick.isInRange(pointer.x, pointer.y)) {
      this.virtualJoystick.onTouchStart(pointer);
      touchInput.isJoystick = true;
    }
    
    // Check touch buttons
    this.touchButtons.forEach((button, id) => {
      if (button.isInRange(pointer.x, pointer.y)) {
        button.onTouchStart(pointer);
        touchInput.isButton = true;
        this.triggerHapticFeedback('light');
      }
    });
    
    // Check touch zones
    this.touchZones.forEach((zone, id) => {
      if (this.isPointInZone(pointer.x, pointer.y, zone)) {
        touchInput.zone = zone;
        this.handleZoneAction(zone, 'start');
      }
    });
    
    this.activeTouches.set(pointer.id, touchInput);
  }
  
  /**
   * Handle touch move event
   */
  public onTouchMove(pointer: Phaser.Input.Pointer): void {
    const touchInput = this.activeTouches.get(pointer.id);
    if (!touchInput) return;
    
    touchInput.x = pointer.x;
    touchInput.y = pointer.y;
    
    if (touchInput.isJoystick && this.virtualJoystick) {
      this.virtualJoystick.onTouchMove(pointer);
    }
    
    if (touchInput.zone) {
      this.handleZoneAction(touchInput.zone, 'move');
    }
  }
  
  /**
   * Handle touch end event
   */
  public onTouchEnd(pointer: Phaser.Input.Pointer): void {
    const touchInput = this.activeTouches.get(pointer.id);
    if (!touchInput) return;
    
    if (touchInput.isJoystick && this.virtualJoystick) {
      this.virtualJoystick.onTouchEnd(pointer);
    }
    
    if (touchInput.isButton) {
      this.touchButtons.forEach(button => {
        if (button.isActive) {
          button.onTouchEnd(pointer);
        }
      });
    }
    
    if (touchInput.zone) {
      this.handleZoneAction(touchInput.zone, 'end');
    }
    
    // Check for gestures
    this.checkGestures(touchInput);
    
    this.activeTouches.delete(pointer.id);
  }
  
  /**
   * Create touch button
   */
  public createTouchButton(
    id: string,
    x: number,
    y: number,
    action: string,
    icon?: string,
    color: number = 0x4CAF50
  ): TouchButton {
    const button = new TouchButton(this.scene, x, y, this.touchConfig.buttonSize, action, icon, color);
    button.setAlpha(this.touchConfig.buttonAlpha);
    button.setVisible(this.deviceInfo.isMobile && this.touchConfig.showVisuals);
    
    this.touchButtons.set(id, button);
    
    if (this.uiContainer) {
      this.uiContainer.add(button.getContainer());
    }
    
    console.log(`📱 Created touch button: ${id}`);
    return button;
  }
  
  /**
   * Create touch zone
   */
  public createTouchZone(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    action: string,
    shape: 'rectangle' | 'circle' = 'rectangle'
  ): void {
    const zone: TouchZone = {
      id,
      x,
      y,
      width,
      height,
      shape,
      action,
      active: true
    };
    
    if (this.touchConfig.showVisuals) {
      if (shape === 'rectangle') {
        zone.visual = this.scene.add.rectangle(x, y, width, height, 0xFFFFFF, 0.1);
      } else {
        zone.visual = this.scene.add.circle(x, y, width / 2, 0xFFFFFF, 0.1);
      }
      zone.visual.setDepth(1000);
    }
    
    this.touchZones.set(id, zone);
    console.log(`📱 Created touch zone: ${id}`);
  }
  
  /**
   * Set UI scale for mobile
   */
  public setUIScale(scale: number): void {
    this.uiConfig.scaleFactor = scale;
    
    if (this.uiContainer) {
      this.uiContainer.setScale(scale);
    }
    
    console.log(`📱 UI scale set to ${scale}`);
  }
  
  /**
   * Get device information
   */
  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
  
  /**
   * Check if device is mobile
   */
  public isMobile(): boolean {
    return this.deviceInfo.isMobile;
  }
  
  /**
   * Trigger haptic feedback
   */
  public triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!this.hapticSupported || !this.touchConfig.hapticFeedback) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };
    
    navigator.vibrate(patterns[intensity]);
  }
  
  /**
   * Show mobile tutorial
   */
  public showMobileTutorial(): void {
    if (!this.deviceInfo.isMobile) return;
    
    const tutorial = this.scene.add.container(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY);
    
    const bg = this.scene.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
    const title = this.scene.add.text(0, -60, 'Touch Controls', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    const instructions = [
      'Use virtual joystick to move',
      'Tap action buttons to interact',
      'Pinch to zoom camera',
      'Double-tap to open inventory'
    ];
    
    const instructionTexts = instructions.map((text, index) => {
      return this.scene.add.text(0, -20 + (index * 20), text, {
        fontSize: '12px',
        color: '#CCCCCC',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });
    
    const closeButton = this.scene.add.text(0, 70, 'Got it!', {
      fontSize: '14px',
      color: '#4CAF50',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5).setInteractive();
    
    closeButton.on('pointerdown', () => {
      tutorial.destroy();
    });
    
    tutorial.add([bg, title, ...instructionTexts, closeButton]);
    tutorial.setDepth(2000);
    
    console.log('📱 Mobile tutorial shown');
  }
  
  /**
   * Optimize for mobile performance
   */
  public optimizeForMobile(): void {
    if (!this.deviceInfo.isMobile) return;
    
    // Apply mobile optimizations
    this.scene.events.emit('mobile-optimization', {
      reduceParticles: this.mobileOptimizations.reducedParticles,
      simplifyShaders: this.mobileOptimizations.simplifiedShaders,
      lowerTextureQuality: this.mobileOptimizations.lowerTextureQuality,
      reduceAudioChannels: this.mobileOptimizations.reducedAudioChannels
    });
    
    console.log('📱 Mobile optimizations applied');
  }
  
  /**
   * Destroy mobile support
   */
  public destroy(): void {
    this.touchButtons.forEach(button => button.destroy());
    this.touchButtons.clear();
    
    this.touchZones.forEach(zone => {
      if (zone.visual) {
        zone.visual.destroy();
      }
    });
    this.touchZones.clear();
    
    if (this.virtualJoystick) {
      this.virtualJoystick.destroy();
    }
    
    if (this.uiContainer) {
      this.uiContainer.destroy();
    }
    
    console.log('📱 MobileSupport destroyed');
  }
  
  // Private methods
  
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
    const isTablet = /tablet|ipad/.test(userAgent) || (isAndroid && !/mobile/.test(userAgent));
    
    return {
      isMobile: isMobile || isTablet,
      isTablet,
      isIOS,
      isAndroid,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      touchSupport: 'ontouchstart' in window,
      accelerometerSupport: 'DeviceMotionEvent' in window,
      batteryAPI: 'getBattery' in navigator
    };
  }
  
  private calculateUIScale(): number {
    const baseWidth = 800;
    const baseHeight = 600;
    
    const scaleX = this.deviceInfo.screenWidth / baseWidth;
    const scaleY = this.deviceInfo.screenHeight / baseHeight;
    
    // Use the smaller scale to ensure UI fits
    return Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x
  }
  
  private calculateSafeArea(): { top: number; bottom: number; left: number; right: number } {
    // Default safe area
    let safeArea = { top: 0, bottom: 0, left: 0, right: 0 };
    
    // iOS notch detection
    if (this.deviceInfo.isIOS && 'CSS' in window && 'supports' in window.CSS) {
      const supports = (window.CSS as any).supports;
      if (supports('padding: env(safe-area-inset-top)')) {
        // Device has notch/safe area
        safeArea = {
          top: 44, // Status bar + notch
          bottom: 34, // Home indicator
          left: 0,
          right: 0
        };
      }
    }
    
    return safeArea;
  }
  
  private initializeMobileControls(): void {
    // Create UI container
    this.uiContainer = this.scene.add.container(0, 0);
    this.uiContainer.setDepth(1000);
    
    // Create virtual joystick
    this.virtualJoystick = new VirtualJoystick(
      this.scene,
      this.touchConfig.joystickSize + this.safeArea.left + this.uiConfig.marginSize,
      this.deviceInfo.screenHeight - this.touchConfig.joystickSize - this.safeArea.bottom - this.uiConfig.marginSize,
      this.touchConfig
    );
    
    if (this.uiContainer) {
      this.uiContainer.add(this.virtualJoystick.getContainer());
    }
    
    // Create action buttons
    this.createActionButtons();
    
    // Setup touch event listeners
    this.scene.input.on('pointerdown', this.onTouchStart, this);
    this.scene.input.on('pointermove', this.onTouchMove, this);
    this.scene.input.on('pointerup', this.onTouchEnd, this);
    
    console.log('📱 Mobile controls initialized');
  }
  
  private createActionButtons(): void {
    const buttonY = this.deviceInfo.screenHeight - this.touchConfig.buttonSize - this.safeArea.bottom - this.uiConfig.marginSize;
    const rightMargin = this.safeArea.right + this.uiConfig.marginSize;
    
    // Attack button
    this.createTouchButton(
      'attack',
      this.deviceInfo.screenWidth - rightMargin - this.touchConfig.buttonSize,
      buttonY,
      'attack',
      '⚔️',
      0xF44336
    );
    
    // Ability button
    this.createTouchButton(
      'ability',
      this.deviceInfo.screenWidth - rightMargin - this.touchConfig.buttonSize * 2 - this.uiConfig.buttonSpacing,
      buttonY,
      'ability',
      '✨',
      0x2196F3
    );
    
    // Inventory button
    this.createTouchButton(
      'inventory',
      this.deviceInfo.screenWidth - rightMargin - this.touchConfig.buttonSize,
      buttonY - this.touchConfig.buttonSize - this.uiConfig.buttonSpacing,
      'inventory',
      '🎒',
      0x9C27B0
    );
  }
  
  private setupMobileOptimizations(): void {
    // Reduce particle count
    if (this.mobileOptimizations.reducedParticles) {
      this.scene.events.emit('set-particle-limit', 100);
    }
    
    // Lower audio quality
    if (this.mobileOptimizations.reducedAudioChannels) {
      this.scene.events.emit('set-audio-channels', 4);
    }
    
    // Set texture quality
    if (this.mobileOptimizations.lowerTextureQuality) {
      this.scene.events.emit('set-texture-quality', 'medium');
    }
  }
  
  private setupOrientationHandling(): void {
    const handleOrientationChange = () => {
      setTimeout(() => {
        this.deviceInfo.screenWidth = window.innerWidth;
        this.deviceInfo.screenHeight = window.innerHeight;
        this.deviceInfo.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        
        this.updateUILayout();
        this.scene.events.emit('orientation-changed', this.deviceInfo.orientation);
      }, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }
  
  private updateTouchButtons(time: number, delta: number): void {
    this.touchButtons.forEach(button => {
      button.update(time, delta);
    });
  }
  
  private handleBatteryOptimizations(): void {
    if (!this.deviceInfo.batteryAPI) return;
    
    (navigator as any).getBattery?.().then((battery: any) => {
      if (battery.level < 0.2 && !battery.charging) {
        // Enable power saving mode
        this.scene.events.emit('enable-power-saving');
      }
    });
  }
  
  private updateUILayout(): void {
    if (!this.uiConfig.adaptiveLayout || !this.uiContainer) return;
    
    // Reposition UI elements for new screen size
    if (this.virtualJoystick) {
      this.virtualJoystick.setPosition(
        this.touchConfig.joystickSize + this.safeArea.left + this.uiConfig.marginSize,
        this.deviceInfo.screenHeight - this.touchConfig.joystickSize - this.safeArea.bottom - this.uiConfig.marginSize
      );
    }
    
    // Update button positions
    this.repositionActionButtons();
  }
  
  private repositionActionButtons(): void {
    const buttonY = this.deviceInfo.screenHeight - this.touchConfig.buttonSize - this.safeArea.bottom - this.uiConfig.marginSize;
    const rightMargin = this.safeArea.right + this.uiConfig.marginSize;
    
    const attackButton = this.touchButtons.get('attack');
    if (attackButton) {
      attackButton.setPosition(
        this.deviceInfo.screenWidth - rightMargin - this.touchConfig.buttonSize,
        buttonY
      );
    }
    
    const abilityButton = this.touchButtons.get('ability');
    if (abilityButton) {
      abilityButton.setPosition(
        this.deviceInfo.screenWidth - rightMargin - this.touchConfig.buttonSize * 2 - this.uiConfig.buttonSpacing,
        buttonY
      );
    }
    
    const inventoryButton = this.touchButtons.get('inventory');
    if (inventoryButton) {
      inventoryButton.setPosition(
        this.deviceInfo.screenWidth - rightMargin - this.touchConfig.buttonSize,
        buttonY - this.touchConfig.buttonSize - this.uiConfig.buttonSpacing
      );
    }
  }
  
  private isPointInZone(x: number, y: number, zone: TouchZone): boolean {
    if (zone.shape === 'rectangle') {
      return x >= zone.x - zone.width / 2 &&
             x <= zone.x + zone.width / 2 &&
             y >= zone.y - zone.height / 2 &&
             y <= zone.y + zone.height / 2;
    } else {
      const distance = Phaser.Math.Distance.Between(x, y, zone.x, zone.y);
      return distance <= zone.width / 2;
    }
  }
  
  private handleZoneAction(zone: TouchZone, phase: 'start' | 'move' | 'end'): void {
    this.scene.events.emit(`touch-zone-${phase}`, { zone: zone.id, action: zone.action });
  }
  
  private checkGestures(touchInput: TouchInput): void {
    const duration = Date.now() - touchInput.startTime;
    const distance = Phaser.Math.Distance.Between(
      touchInput.startX, touchInput.startY,
      touchInput.x, touchInput.y
    );
    
    // Tap gesture
    if (duration < 200 && distance < 20) {
      this.scene.events.emit('mobile-tap', { x: touchInput.x, y: touchInput.y });
    }
    
    // Swipe gesture
    if (duration < 500 && distance > 100) {
      const angle = Phaser.Math.Angle.Between(
        touchInput.startX, touchInput.startY,
        touchInput.x, touchInput.y
      );
      
      let direction = 'right';
      if (angle > -Math.PI / 4 && angle < Math.PI / 4) direction = 'right';
      else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) direction = 'down';
      else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) direction = 'left';
      else direction = 'up';
      
      this.scene.events.emit('mobile-swipe', { direction, distance });
    }
  }
}

// Virtual Joystick Implementation
class VirtualJoystick {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private base: Phaser.GameObjects.Circle;
  private knob: Phaser.GameObjects.Circle;
  private config: TouchControlConfig;
  private hero?: Hero;
  
  private isActive: boolean = false;
  private currentVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  
  constructor(scene: Phaser.Scene, x: number, y: number, config: TouchControlConfig) {
    this.scene = scene;
    this.config = config;
    
    this.container = scene.add.container(x, y);
    
    // Create joystick base
    this.base = scene.add.circle(0, 0, config.joystickSize / 2, 0x333333, config.joystickAlpha);
    this.base.setStrokeStyle(2, 0x666666);
    
    // Create joystick knob
    this.knob = scene.add.circle(0, 0, config.joystickSize / 4, 0x666666, config.joystickAlpha);
    this.knob.setStrokeStyle(2, 0x999999);
    
    this.container.add([this.base, this.knob]);
    this.container.setVisible(config.showVisuals);
  }
  
  public setTarget(hero: Hero): void {
    this.hero = hero;
  }
  
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
  
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
  
  public isInRange(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      x, y,
      this.container.x, this.container.y
    );
    return distance <= this.config.joystickSize;
  }
  
  public onTouchStart(pointer: Phaser.Input.Pointer): void {
    this.isActive = true;
    this.updateKnobPosition(pointer);
  }
  
  public onTouchMove(pointer: Phaser.Input.Pointer): void {
    if (this.isActive) {
      this.updateKnobPosition(pointer);
    }
  }
  
  public onTouchEnd(pointer: Phaser.Input.Pointer): void {
    this.isActive = false;
    this.knob.setPosition(0, 0);
    this.currentVector.set(0, 0);
  }
  
  public update(delta: number): void {
    if (this.hero && this.currentVector.length() > this.config.deadZone) {
      // Apply movement to hero
      const speed = this.hero.stats.speed || 100;
      const moveX = this.currentVector.x * speed * (delta / 1000);
      const moveY = this.currentVector.y * speed * (delta / 1000);
      
      this.hero.setPosition(this.hero.x + moveX, this.hero.y + moveY);
    }
  }
  
  public destroy(): void {
    this.container.destroy();
  }
  
  private updateKnobPosition(pointer: Phaser.Input.Pointer): void {
    const localX = pointer.x - this.container.x;
    const localY = pointer.y - this.container.y;
    
    const distance = Math.sqrt(localX * localX + localY * localY);
    const maxDistance = this.config.maxDistance;
    
    if (distance <= maxDistance) {
      this.knob.setPosition(localX, localY);
      this.currentVector.set(localX / maxDistance, localY / maxDistance);
    } else {
      const angle = Math.atan2(localY, localX);
      const clampedX = Math.cos(angle) * maxDistance;
      const clampedY = Math.sin(angle) * maxDistance;
      
      this.knob.setPosition(clampedX, clampedY);
      this.currentVector.set(Math.cos(angle), Math.sin(angle));
    }
  }
}

// Touch Button Implementation
class TouchButton {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Circle;
  private icon?: Phaser.GameObjects.Text;
  private action: string;
  
  public isActive: boolean = false;
  private pressStartTime: number = 0;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    action: string,
    iconText?: string,
    color: number = 0x4CAF50
  ) {
    this.scene = scene;
    this.action = action;
    
    this.container = scene.add.container(x, y);
    
    // Create button background
    this.background = scene.add.circle(0, 0, size / 2, color, 0.8);
    this.background.setStrokeStyle(2, 0xFFFFFF, 0.5);
    
    // Create icon
    if (iconText) {
      this.icon = scene.add.text(0, 0, iconText, {
        fontSize: `${size / 3}px`,
        color: '#FFFFFF',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
    
    this.container.add([this.background, this.icon].filter(Boolean) as Phaser.GameObjects.GameObject[]);
  }
  
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
  
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
  
  public setAlpha(alpha: number): void {
    this.container.setAlpha(alpha);
  }
  
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
  
  public isInRange(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      x, y,
      this.container.x, this.container.y
    );
    return distance <= this.background.radius;
  }
  
  public onTouchStart(pointer: Phaser.Input.Pointer): void {
    this.isActive = true;
    this.pressStartTime = Date.now();
    this.background.setScale(0.9);
    this.background.setTint(0xCCCCCC);
    
    // Trigger action
    this.scene.events.emit('mobile-button-press', this.action);
  }
  
  public onTouchEnd(pointer: Phaser.Input.Pointer): void {
    if (this.isActive) {
      this.isActive = false;
      this.background.setScale(1);
      this.background.clearTint();
      
      // Trigger release action
      this.scene.events.emit('mobile-button-release', this.action);
    }
  }
  
  public update(time: number, delta: number): void {
    // Handle long press
    if (this.isActive && Date.now() - this.pressStartTime > 500) {
      this.scene.events.emit('mobile-button-long-press', this.action);
      this.pressStartTime = Date.now(); // Reset to prevent multiple triggers
    }
  }
  
  public destroy(): void {
    this.container.destroy();
  }
}

// Touch Input Interface
interface TouchInput {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
  isJoystick: boolean;
  isButton: boolean;
  zone: TouchZone | null;
}

