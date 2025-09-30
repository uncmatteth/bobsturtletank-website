/**
 * UISystem - Advanced user interface and user experience system
 * Creates beautiful, accessible, and responsive interfaces for all players
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';

export interface UITheme {
  id: string;
  name: string;
  colors: {
    primary: number;
    secondary: number;
    accent: number;
    background: number;
    surface: number;
    text: number;
    textSecondary: number;
    success: number;
    warning: number;
    error: number;
  };
  fonts: {
    primary: string;
    secondary: string;
    ui: string;
    sizes: {
      small: number;
      medium: number;
      large: number;
      title: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: number;
  shadows: boolean;
  animations: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  colorBlindSupport: boolean;
  soundCues: boolean;
  hapticFeedback: boolean;
  simplifiedUI: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

export interface UIComponent {
  id: string;
  type: 'button' | 'panel' | 'modal' | 'tooltip' | 'notification' | 'menu' | 'inventory' | 'healthbar';
  container: Phaser.GameObjects.Container;
  visible: boolean;
  interactive: boolean;
  accessible: boolean;
  animations: UIAnimation[];
  theme: string;
  zIndex: number;
}

export interface UIAnimation {
  id: string;
  type: 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'scale' | 'bounce' | 'shake' | 'pulse';
  duration: number;
  ease: string;
  delay?: number;
  loop?: boolean;
  onComplete?: () => void;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  title: string;
  message: string;
  duration: number;
  icon?: string;
  actions?: NotificationAction[];
  priority: number;
  timestamp: number;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

export interface Tooltip {
  id: string;
  target: Phaser.GameObjects.GameObject;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay: number;
  maxWidth: number;
  visible: boolean;
}

export interface Modal {
  id: string;
  title: string;
  content: Phaser.GameObjects.Container;
  width: number;
  height: number;
  closable: boolean;
  draggable: boolean;
  resizable: boolean;
  overlay: boolean;
  animation: string;
  onClose?: () => void;
}

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth: number;
  uiScale: number;
  layoutChanges: any;
}

export class UISystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // UI Management
  private uiComponents: Map<string, UIComponent> = new Map();
  private activeModals: Modal[] = [];
  private notifications: Notification[] = [];
  private tooltips: Map<string, Tooltip> = new Map();
  
  // Theming and accessibility
  private currentTheme: UITheme;
  private availableThemes: Map<string, UITheme> = new Map();
  private accessibilitySettings: AccessibilitySettings;
  
  // Responsive design
  private currentBreakpoint: ResponsiveBreakpoint;
  private breakpoints: ResponsiveBreakpoint[] = [];
  private baseUIScale: number = 1.0;
  
  // Animation and transitions
  private animationQueue: UIAnimation[] = [];
  private transitionSpeed: number = 1.0;
  
  // Interaction and navigation
  private focusedElement?: UIComponent;
  private navigationHistory: string[] = [];
  private keyboardNavigationEnabled: boolean = true;
  
  // Performance and caching
  private uiCache: Map<string, Phaser.GameObjects.Container> = new Map();
  private maxCachedComponents: number = 50;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.initializeThemes();
    this.initializeAccessibilitySettings();
    this.initializeResponsiveBreakpoints();
    this.setupKeyboardNavigation();
    this.setupEventListeners();
    
    // Set default theme
    this.currentTheme = this.availableThemes.get('default')!;
    this.currentBreakpoint = this.breakpoints[0];
    
    console.log('🎨 UISystem initialized');
  }
  
  /**
   * Initialize UI system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.createBaseUI();
    this.setupHeroUIUpdates();
    
    console.log('🎨 UI system connected to hero');
  }
  
  /**
   * Update UI system
   */
  public update(time: number, delta: number): void {
    this.updateAnimations(delta);
    this.updateNotifications(time);
    this.updateTooltips();
    this.updateResponsiveLayout();
    this.updateAccessibilityFeatures();
    this.manageUIPerformance();
  }
  
  /**
   * Create UI component
   */
  public createComponent(
    id: string,
    type: UIComponent['type'],
    x: number,
    y: number,
    config: any = {}
  ): UIComponent {
    const container = this.scene.add.container(x, y);
    
    const component: UIComponent = {
      id,
      type,
      container,
      visible: true,
      interactive: config.interactive !== false,
      accessible: config.accessible !== false,
      animations: [],
      theme: config.theme || 'default',
      zIndex: config.zIndex || 0
    };
    
    // Apply theme styling
    this.applyThemeToComponent(component);
    
    // Setup accessibility
    if (component.accessible) {
      this.setupComponentAccessibility(component);
    }
    
    // Setup interactions
    if (component.interactive) {
      this.setupComponentInteractions(component);
    }
    
    this.uiComponents.set(id, component);
    
    console.log(`🎨 Created UI component: ${id} (${type})`);
    return component;
  }
  
  /**
   * Create notification
   */
  public createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    duration: number = 4000,
    actions: NotificationAction[] = []
  ): string {
    const id = `notification_${Date.now()}_${Math.random()}`;
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      actions,
      priority: this.getNotificationPriority(type),
      timestamp: Date.now()
    };
    
    this.notifications.push(notification);
    this.sortNotificationsByPriority();
    this.displayNotification(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
      this.scene.time.delayedCall(duration, () => {
        this.removeNotification(id);
      });
    }
    
    console.log(`🔔 Created notification: ${title}`);
    return id;
  }
  
  /**
   * Create modal
   */
  public createModal(
    id: string,
    title: string,
    content: Phaser.GameObjects.Container,
    config: Partial<Modal> = {}
  ): Modal {
    const modal: Modal = {
      id,
      title,
      content,
      width: config.width || 400,
      height: config.height || 300,
      closable: config.closable !== false,
      draggable: config.draggable || false,
      resizable: config.resizable || false,
      overlay: config.overlay !== false,
      animation: config.animation || 'fadeIn',
      onClose: config.onClose
    };
    
    this.activeModals.push(modal);
    this.displayModal(modal);
    
    console.log(`🪟 Created modal: ${id}`);
    return modal;
  }
  
  /**
   * Create tooltip
   */
  public createTooltip(
    id: string,
    target: Phaser.GameObjects.GameObject,
    content: string,
    config: Partial<Tooltip> = {}
  ): Tooltip {
    const tooltip: Tooltip = {
      id,
      target,
      content,
      position: config.position || 'auto',
      delay: config.delay || 500,
      maxWidth: config.maxWidth || 200,
      visible: false
    };
    
    this.tooltips.set(id, tooltip);
    this.setupTooltipEvents(tooltip);
    
    console.log(`💬 Created tooltip: ${id}`);
    return tooltip;
  }
  
  /**
   * Set UI theme
   */
  public setTheme(themeId: string): void {
    const theme = this.availableThemes.get(themeId);
    if (!theme) {
      console.warn(`Theme not found: ${themeId}`);
      return;
    }
    
    this.currentTheme = theme;
    this.applyThemeToAllComponents();
    
    console.log(`🎨 Theme changed to: ${theme.name}`);
  }
  
  /**
   * Update accessibility settings
   */
  public setAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
    this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
    this.applyAccessibilitySettings();
    
    console.log('♿ Accessibility settings updated');
  }
  
  /**
   * Animate UI component
   */
  public animateComponent(componentId: string, animation: UIAnimation): void {
    const component = this.uiComponents.get(componentId);
    if (!component) {
      console.warn(`Component not found: ${componentId}`);
      return;
    }
    
    // Skip animations if reduced motion is enabled
    if (this.accessibilitySettings.reducedMotion && animation.type !== 'fadeIn' && animation.type !== 'fadeOut') {
      animation.onComplete?.();
      return;
    }
    
    this.animationQueue.push({ ...animation, id: componentId });
    this.processAnimationQueue();
  }
  
  /**
   * Show loading state
   */
  public showLoading(message: string = 'Loading...'): string {
    const loadingId = this.createModal('loading', 'Loading', this.createLoadingContent(message), {
      closable: false,
      overlay: true,
      animation: 'fadeIn'
    }).id;
    
    return loadingId;
  }
  
  /**
   * Hide loading state
   */
  public hideLoading(loadingId: string): void {
    this.closeModal(loadingId);
  }
  
  /**
   * Focus UI component
   */
  public focusComponent(componentId: string): void {
    const component = this.uiComponents.get(componentId);
    if (!component || !component.accessible) return;
    
    // Remove focus from current element
    if (this.focusedElement) {
      this.removeFocus(this.focusedElement);
    }
    
    // Apply focus to new element
    this.focusedElement = component;
    this.applyFocus(component);
    
    // Add to navigation history
    this.navigationHistory.push(componentId);
    if (this.navigationHistory.length > 10) {
      this.navigationHistory.shift();
    }
  }
  
  /**
   * Navigate back in UI
   */
  public navigateBack(): boolean {
    if (this.navigationHistory.length < 2) return false;
    
    this.navigationHistory.pop(); // Remove current
    const previousId = this.navigationHistory.pop(); // Get previous
    
    if (previousId) {
      this.focusComponent(previousId);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get UI statistics
   */
  public getUIStats(): any {
    return {
      theme: this.currentTheme.name,
      components: this.uiComponents.size,
      activeModals: this.activeModals.length,
      notifications: this.notifications.length,
      tooltips: this.tooltips.size,
      breakpoint: this.currentBreakpoint.name,
      uiScale: this.baseUIScale,
      accessibility: {
        highContrast: this.accessibilitySettings.highContrast,
        reducedMotion: this.accessibilitySettings.reducedMotion,
        largeText: this.accessibilitySettings.largeText,
        keyboardNavigation: this.accessibilitySettings.keyboardNavigation
      },
      performance: {
        cachedComponents: this.uiCache.size,
        animationQueue: this.animationQueue.length,
        focusedElement: this.focusedElement?.id || 'none'
      }
    };
  }
  
  /**
   * Remove notification
   */
  public removeNotification(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.hideNotificationDisplay(id);
    }
  }
  
  /**
   * Close modal
   */
  public closeModal(id: string): void {
    const index = this.activeModals.findIndex(m => m.id === id);
    if (index !== -1) {
      const modal = this.activeModals[index];
      this.activeModals.splice(index, 1);
      this.hideModalDisplay(modal);
      modal.onClose?.();
    }
  }
  
  /**
   * Destroy UI system
   */
  public destroy(): void {
    // Clear all components
    this.uiComponents.forEach(component => {
      component.container.destroy();
    });
    this.uiComponents.clear();
    
    // Clear modals
    this.activeModals.forEach(modal => {
      modal.content.destroy();
    });
    this.activeModals = [];
    
    // Clear cache
    this.uiCache.forEach(cached => {
      cached.destroy();
    });
    this.uiCache.clear();
    
    console.log('🎨 UISystem destroyed');
  }
  
  // Private methods
  
  private initializeThemes(): void {
    // Default theme
    const defaultTheme: UITheme = {
      id: 'default',
      name: 'Classic Turtle',
      colors: {
        primary: 0x4CAF50,
        secondary: 0x2196F3,
        accent: 0xFFD700,
        background: 0x1E1E1E,
        surface: 0x2D2D2D,
        text: 0xFFFFFF,
        textSecondary: 0xCCCCCC,
        success: 0x4CAF50,
        warning: 0xFF9800,
        error: 0xF44336
      },
      fonts: {
        primary: 'Arial Black',
        secondary: 'Arial',
        ui: 'Arial',
        sizes: {
          small: 12,
          medium: 16,
          large: 20,
          title: 24
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      borderRadius: 8,
      shadows: true,
      animations: true
    };
    
    // High contrast theme
    const highContrastTheme: UITheme = {
      ...defaultTheme,
      id: 'high_contrast',
      name: 'High Contrast',
      colors: {
        primary: 0xFFFFFF,
        secondary: 0x000000,
        accent: 0xFFFF00,
        background: 0x000000,
        surface: 0x000000,
        text: 0xFFFFFF,
        textSecondary: 0xFFFFFF,
        success: 0x00FF00,
        warning: 0xFFFF00,
        error: 0xFF0000
      }
    };
    
    // Dark theme
    const darkTheme: UITheme = {
      ...defaultTheme,
      id: 'dark',
      name: 'Dark Mode',
      colors: {
        primary: 0x6200EA,
        secondary: 0x3700B3,
        accent: 0x03DAC6,
        background: 0x121212,
        surface: 0x1E1E1E,
        text: 0xFFFFFF,
        textSecondary: 0xAAAAAA,
        success: 0x4CAF50,
        warning: 0xFF9800,
        error: 0xCF6679
      }
    };
    
    // Light theme
    const lightTheme: UITheme = {
      ...defaultTheme,
      id: 'light',
      name: 'Light Mode',
      colors: {
        primary: 0x6200EA,
        secondary: 0x3700B3,
        accent: 0x03DAC6,
        background: 0xFAFAFA,
        surface: 0xFFFFFF,
        text: 0x000000,
        textSecondary: 0x666666,
        success: 0x4CAF50,
        warning: 0xFF9800,
        error: 0xB00020
      }
    };
    
    this.availableThemes.set('default', defaultTheme);
    this.availableThemes.set('high_contrast', highContrastTheme);
    this.availableThemes.set('dark', darkTheme);
    this.availableThemes.set('light', lightTheme);
    
    console.log(`🎨 Initialized ${this.availableThemes.size} UI themes`);
  }
  
  private initializeAccessibilitySettings(): void {
    this.accessibilitySettings = {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false,
      colorBlindSupport: false,
      soundCues: true,
      hapticFeedback: true,
      simplifiedUI: false,
      keyboardNavigation: true,
      focusIndicators: true
    };
    
    // Detect system preferences
    if (window.matchMedia) {
      // Detect reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.accessibilitySettings.reducedMotion = true;
      }
      
      // Detect high contrast preference
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        this.accessibilitySettings.highContrast = true;
      }
    }
    
    console.log('♿ Accessibility settings initialized');
  }
  
  private initializeResponsiveBreakpoints(): void {
    this.breakpoints = [
      {
        name: 'mobile',
        minWidth: 0,
        maxWidth: 768,
        uiScale: 1.2,
        layoutChanges: { stackVertical: true, hideSecondary: true }
      },
      {
        name: 'tablet',
        minWidth: 768,
        maxWidth: 1024,
        uiScale: 1.1,
        layoutChanges: { compactLayout: true }
      },
      {
        name: 'desktop',
        minWidth: 1024,
        maxWidth: 1920,
        uiScale: 1.0,
        layoutChanges: {}
      },
      {
        name: 'large',
        minWidth: 1920,
        maxWidth: 9999,
        uiScale: 0.9,
        layoutChanges: { expandedLayout: true }
      }
    ];
    
    console.log('📱 Responsive breakpoints initialized');
  }
  
  private setupKeyboardNavigation(): void {
    if (!this.keyboardNavigationEnabled) return;
    
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.accessibilitySettings.keyboardNavigation) return;
      
      switch (event.code) {
        case 'Tab':
          event.preventDefault();
          this.navigateToNextComponent(event.shiftKey);
          break;
        case 'Enter':
        case 'Space':
          if (this.focusedElement) {
            this.activateComponent(this.focusedElement);
          }
          break;
        case 'Escape':
          this.navigateBack();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.navigateWithArrows(event.code);
          break;
      }
    });
    
    console.log('⌨️ Keyboard navigation setup complete');
  }
  
  private setupEventListeners(): void {
    // Window resize handler
    window.addEventListener('resize', () => {
      this.updateResponsiveLayout();
    });
    
    // Orientation change handler
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateResponsiveLayout();
      }, 100);
    });
    
    console.log('📡 Event listeners setup complete');
  }
  
  private createBaseUI(): void {
    // Create health bar
    this.createHealthBar();
    
    // Create minimap
    this.createMinimap();
    
    // Create quick action bar
    this.createQuickActionBar();
    
    // Create notification area
    this.createNotificationArea();
    
    console.log('🎨 Base UI created');
  }
  
  private createHealthBar(): void {
    const healthBarContainer = this.scene.add.container(20, 20);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 200, 30, this.currentTheme.colors.surface);
    bg.setStrokeStyle(2, this.currentTheme.colors.primary);
    
    // Health fill
    const healthFill = this.scene.add.rectangle(-75, 0, 150, 20, this.currentTheme.colors.success);
    
    // Health text
    const healthText = this.scene.add.text(0, 0, '100/100', {
      fontSize: `${this.currentTheme.fonts.sizes.small}px`,
      color: `#${this.currentTheme.colors.text.toString(16).padStart(6, '0')}`,
      fontFamily: this.currentTheme.fonts.ui
    }).setOrigin(0.5);
    
    healthBarContainer.add([bg, healthFill, healthText]);
    healthBarContainer.setDepth(1000);
    
    const healthBarComponent: UIComponent = {
      id: 'health_bar',
      type: 'healthbar',
      container: healthBarContainer,
      visible: true,
      interactive: false,
      accessible: true,
      animations: [],
      theme: 'default',
      zIndex: 1000
    };
    
    this.uiComponents.set('health_bar', healthBarComponent);
  }
  
  private createMinimap(): void {
    const minimapContainer = this.scene.add.container(
      this.scene.cameras.main.width - 120,
      20
    );
    
    // Minimap background
    const bg = this.scene.add.rectangle(0, 0, 100, 100, this.currentTheme.colors.surface, 0.8);
    bg.setStrokeStyle(2, this.currentTheme.colors.primary);
    
    // Player dot
    const playerDot = this.scene.add.circle(0, 0, 3, this.currentTheme.colors.accent);
    
    minimapContainer.add([bg, playerDot]);
    minimapContainer.setDepth(1000);
    
    const minimapComponent: UIComponent = {
      id: 'minimap',
      type: 'panel',
      container: minimapContainer,
      visible: true,
      interactive: true,
      accessible: true,
      animations: [],
      theme: 'default',
      zIndex: 1000
    };
    
    this.uiComponents.set('minimap', minimapComponent);
  }
  
  private createQuickActionBar(): void {
    const actionBarContainer = this.scene.add.container(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height - 60
    );
    
    // Create action slots
    for (let i = 0; i < 5; i++) {
      const slotX = (i - 2) * 60;
      const slot = this.scene.add.rectangle(slotX, 0, 50, 50, this.currentTheme.colors.surface);
      slot.setStrokeStyle(2, this.currentTheme.colors.primary);
      slot.setInteractive();
      
      // Hotkey label
      const hotkey = this.scene.add.text(slotX, 25, `${i + 1}`, {
        fontSize: `${this.currentTheme.fonts.sizes.small}px`,
        color: `#${this.currentTheme.colors.textSecondary.toString(16).padStart(6, '0')}`,
        fontFamily: this.currentTheme.fonts.ui
      }).setOrigin(0.5);
      
      actionBarContainer.add([slot, hotkey]);
    }
    
    actionBarContainer.setDepth(1000);
    
    const actionBarComponent: UIComponent = {
      id: 'action_bar',
      type: 'panel',
      container: actionBarContainer,
      visible: true,
      interactive: true,
      accessible: true,
      animations: [],
      theme: 'default',
      zIndex: 1000
    };
    
    this.uiComponents.set('action_bar', actionBarComponent);
  }
  
  private createNotificationArea(): void {
    const notificationContainer = this.scene.add.container(
      this.scene.cameras.main.width - 20,
      80
    );
    
    notificationContainer.setDepth(2000);
    
    const notificationComponent: UIComponent = {
      id: 'notification_area',
      type: 'panel',
      container: notificationContainer,
      visible: true,
      interactive: false,
      accessible: true,
      animations: [],
      theme: 'default',
      zIndex: 2000
    };
    
    this.uiComponents.set('notification_area', notificationComponent);
  }
  
  private setupHeroUIUpdates(): void {
    if (!this.hero) return;
    
    // Update health bar when hero health changes
    this.scene.events.on('hero-health-changed', (health: number, maxHealth: number) => {
      this.updateHealthBar(health, maxHealth);
    });
    
    // Update minimap when hero moves
    this.scene.events.on('hero-position-changed', (x: number, y: number) => {
      this.updateMinimap(x, y);
    });
    
    console.log('🔗 Hero UI updates connected');
  }
  
  private updateHealthBar(health: number, maxHealth: number): void {
    const healthBar = this.uiComponents.get('health_bar');
    if (!healthBar) return;
    
    const healthFill = healthBar.container.list[1] as Phaser.GameObjects.Rectangle;
    const healthText = healthBar.container.list[2] as Phaser.GameObjects.Text;
    
    const healthPercent = health / maxHealth;
    const fillWidth = 150 * healthPercent;
    
    // Animate health bar
    this.scene.tweens.add({
      targets: healthFill,
      scaleX: healthPercent,
      duration: 300,
      ease: 'Power2'
    });
    
    // Update text
    healthText.setText(`${health}/${maxHealth}`);
    
    // Change color based on health percentage
    if (healthPercent > 0.6) {
      healthFill.setFillStyle(this.currentTheme.colors.success);
    } else if (healthPercent > 0.3) {
      healthFill.setFillStyle(this.currentTheme.colors.warning);
    } else {
      healthFill.setFillStyle(this.currentTheme.colors.error);
    }
  }
  
  private updateMinimap(x: number, y: number): void {
    const minimap = this.uiComponents.get('minimap');
    if (!minimap) return;
    
    const playerDot = minimap.container.list[1] as Phaser.GameObjects.Arc;
    
    // Scale world coordinates to minimap coordinates
    const minimapX = (x / 1000) * 80; // Assuming world is 1000 units wide
    const minimapY = (y / 1000) * 80; // Assuming world is 1000 units tall
    
    playerDot.setPosition(minimapX - 40, minimapY - 40);
  }
  
  private applyThemeToComponent(component: UIComponent): void {
    // Apply theme styling to component
    // This would involve updating colors, fonts, spacing, etc.
    component.container.setDepth(component.zIndex);
  }
  
  private applyThemeToAllComponents(): void {
    this.uiComponents.forEach(component => {
      this.applyThemeToComponent(component);
    });
  }
  
  private setupComponentAccessibility(component: UIComponent): void {
    if (!this.accessibilitySettings.focusIndicators) return;
    
    // Add focus indicator
    const focusIndicator = this.scene.add.rectangle(0, 0, 100, 50, 0x00FF00, 0);
    focusIndicator.setStrokeStyle(3, 0x00FF00);
    focusIndicator.setVisible(false);
    component.container.add(focusIndicator);
  }
  
  private setupComponentInteractions(component: UIComponent): void {
    component.container.setInteractive(new Phaser.Geom.Rectangle(-50, -25, 100, 50), Phaser.Geom.Rectangle.Contains);
    
    component.container.on('pointerover', () => {
      if (this.accessibilitySettings.soundCues) {
        this.scene.events.emit('ui-sound', 'hover');
      }
    });
    
    component.container.on('pointerdown', () => {
      if (this.accessibilitySettings.soundCues) {
        this.scene.events.emit('ui-sound', 'click');
      }
      if (this.accessibilitySettings.hapticFeedback) {
        this.scene.events.emit('haptic-feedback', 'light');
      }
    });
  }
  
  private updateAnimations(delta: number): void {
    // Process animation queue
    // Implementation would handle tween animations based on accessibility settings
  }
  
  private updateNotifications(time: number): void {
    // Update notification positions and remove expired ones
    this.notifications = this.notifications.filter(notification => {
      if (notification.duration > 0 && time - notification.timestamp > notification.duration) {
        this.hideNotificationDisplay(notification.id);
        return false;
      }
      return true;
    });
  }
  
  private updateTooltips(): void {
    // Update tooltip visibility and positioning
    this.tooltips.forEach(tooltip => {
      // Implementation would handle tooltip display logic
    });
  }
  
  private updateResponsiveLayout(): void {
    const screenWidth = this.scene.cameras.main.width;
    
    // Find current breakpoint
    const newBreakpoint = this.breakpoints.find(bp => 
      screenWidth >= bp.minWidth && screenWidth <= bp.maxWidth
    ) || this.breakpoints[0];
    
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      this.applyResponsiveChanges();
    }
  }
  
  private updateAccessibilityFeatures(): void {
    // Apply accessibility updates based on current settings
    if (this.accessibilitySettings.highContrast && this.currentTheme.id !== 'high_contrast') {
      this.setTheme('high_contrast');
    }
  }
  
  private manageUIPerformance(): void {
    // Clean up UI cache if it gets too large
    if (this.uiCache.size > this.maxCachedComponents) {
      const entries = Array.from(this.uiCache.entries());
      const toRemove = entries.slice(0, this.maxCachedComponents / 2);
      
      toRemove.forEach(([key, container]) => {
        container.destroy();
        this.uiCache.delete(key);
      });
    }
  }
  
  private getNotificationPriority(type: Notification['type']): number {
    const priorities = {
      error: 5,
      warning: 4,
      achievement: 3,
      success: 2,
      info: 1
    };
    return priorities[type] || 1;
  }
  
  private sortNotificationsByPriority(): void {
    this.notifications.sort((a, b) => b.priority - a.priority);
  }
  
  private displayNotification(notification: Notification): void {
    const container = this.uiComponents.get('notification_area')?.container;
    if (!container) return;
    
    // Create notification display
    const notificationDisplay = this.scene.add.container(0, container.list.length * 80);
    
    const bg = this.scene.add.rectangle(0, 0, 280, 70, this.currentTheme.colors.surface);
    bg.setStrokeStyle(2, this.getNotificationColor(notification.type));
    
    const title = this.scene.add.text(-120, -15, notification.title, {
      fontSize: `${this.currentTheme.fonts.sizes.medium}px`,
      color: `#${this.currentTheme.colors.text.toString(16).padStart(6, '0')}`,
      fontFamily: this.currentTheme.fonts.primary
    });
    
    const message = this.scene.add.text(-120, 5, notification.message, {
      fontSize: `${this.currentTheme.fonts.sizes.small}px`,
      color: `#${this.currentTheme.colors.textSecondary.toString(16).padStart(6, '0')}`,
      fontFamily: this.currentTheme.fonts.ui,
      wordWrap: { width: 240 }
    });
    
    notificationDisplay.add([bg, title, message]);
    container.add(notificationDisplay);
    
    // Animate in
    notificationDisplay.setAlpha(0);
    notificationDisplay.setScale(0.8);
    
    this.scene.tweens.add({
      targets: notificationDisplay,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
  
  private hideNotificationDisplay(id: string): void {
    // Implementation would remove notification from display
  }
  
  private displayModal(modal: Modal): void {
    // Implementation would create modal display
  }
  
  private hideModalDisplay(modal: Modal): void {
    // Implementation would remove modal from display
  }
  
  private setupTooltipEvents(tooltip: Tooltip): void {
    // Implementation would setup tooltip hover events
  }
  
  private createLoadingContent(message: string): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    
    const text = this.scene.add.text(0, 0, message, {
      fontSize: `${this.currentTheme.fonts.sizes.medium}px`,
      color: `#${this.currentTheme.colors.text.toString(16).padStart(6, '0')}`,
      fontFamily: this.currentTheme.fonts.ui
    }).setOrigin(0.5);
    
    const spinner = this.scene.add.arc(0, -30, 15, 0, 360, false, this.currentTheme.colors.primary);
    
    // Animate spinner
    this.scene.tweens.add({
      targets: spinner,
      rotation: Math.PI * 2,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });
    
    container.add([spinner, text]);
    return container;
  }
  
  private getNotificationColor(type: Notification['type']): number {
    const colors = {
      info: this.currentTheme.colors.primary,
      success: this.currentTheme.colors.success,
      warning: this.currentTheme.colors.warning,
      error: this.currentTheme.colors.error,
      achievement: this.currentTheme.colors.accent
    };
    return colors[type] || this.currentTheme.colors.primary;
  }
  
  private processAnimationQueue(): void {
    // Implementation would process queued animations
  }
  
  private applyAccessibilitySettings(): void {
    // Implementation would apply accessibility settings
  }
  
  private applyResponsiveChanges(): void {
    // Implementation would apply responsive layout changes
  }
  
  private navigateToNextComponent(reverse: boolean = false): void {
    // Implementation would handle keyboard navigation
  }
  
  private navigateWithArrows(direction: string): void {
    // Implementation would handle arrow key navigation
  }
  
  private activateComponent(component: UIComponent): void {
    // Implementation would activate/click component
  }
  
  private applyFocus(component: UIComponent): void {
    // Implementation would apply focus styling
  }
  
  private removeFocus(component: UIComponent): void {
    // Implementation would remove focus styling
  }
}

