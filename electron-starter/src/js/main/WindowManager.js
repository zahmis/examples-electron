import Path          from 'path';
import BrowserWindow from 'browser-window';
import Util          from '../common/Util.js';
import { IPCKeys }   from '../common/Constants.js';

/**
 * Define the type of window.
 * @type {Object}
 */
export const WindowTypes = {
  Main:  'main',
  About: 'about'
};

/**
 * Manage the window.
 */
export default class WindowManager {
  /**
   * Initialize instance.
   *
   * @param {Main} context Application context.
   */
  constructor( context ) {
    /**
     * Application context.
     * @type {Main}
     */
    this._context = context;

    /**
     * Collection of a managed window.
     * @type {Map}
     */
    this._windows = new Map();

    // IPC handlers
    context.ipc.on( IPCKeys.RequestShowURL, this._onRequestShowURL.bind( this ) );
  }

  /**
   * Get the window from key.
   *
   * @param {WindowTypes} type Window type.
   *
   * @return {BrowserWindow} Successful if window instance, otherwise undefined.
   */
  getWindow( type ) {
    return this._windows.get( type );
  }

  /**
   * Close a window.
   *
   * @param {WindowTypes} type Window type.
   */
  close( type ) {
    const w = this._windows.get( type );
    if( !( w ) ) { return; }

    w.close();
  }

  /**
   * Show a window.
   *
   * @param {WindowTypes} type Window type.
   */
  show( type ) {
    switch( type ) {
      case WindowTypes.Main:
        this._showMain();
        break;

      case WindowTypes.About:
        this._showAbout();
        break;

      case WindowTypes.GraphicEqualizer:
        this._showGraphicEqualizer();
        break;

      default:
        break;
    }
  }

  /**
   * Switch the window display, Show or hide.
   *
   * @param {WindowTypes} type Window type.
   */
  toggle( type ) {
    // Main window is always showing
    if( type === WindowTypes.Main ) { return; }

    const w = this._windows.get( type );
    if( w ) {
      if( w.isVisible() ) {
        w.hide();
      } else {
        w.show();
      }
    } else {
      this.show( type );
    }
  }

  /**
   * Reload the focused window, For debug.
   */
  reload() {
    const w = BrowserWindow.getFocusedWindow();
    if( w ) {
      w.reload();
    }
  }

  /**
   * Switch the display of the developer tools window at focused window, For debug.
   */
  toggleDevTools() {
    const w = BrowserWindow.getFocusedWindow();
    if( w ) {
      w.toggleDevTools();
    }
  }

  /**
   * Show the main window.
   */
  _showMain() {
    if( this._windows.get( WindowTypes.Main ) ) { return; }

    const w = new BrowserWindow( {
      width: 600,
      height: 480,
      minWidth: 480,
      minHeight: 320,
      resizable: true
    } );

    w.on( 'closed', () => {
      if( DEBUG ) { Util.log( 'The main window was closed.' ); }

      // Close an other windows
      this._windows.forEach( ( value, key ) => {
        if( key === WindowTypes.Main ) { return; }

        value.close();
      } );

      this._windows.delete( WindowTypes.Main );
    } );

    const filePath = Path.join( __dirname, 'window-main.html' );
    w.loadURL( 'file://' + filePath );

    this._windows.set( WindowTypes.Main, w );
  }

  /**
   * Show the about application window.
   */
  _showAbout() {
    if( this._windows.get( WindowTypes.About ) ) { return; }

    const w = new BrowserWindow( {
      width: 400,
      height: 256,
      resizable: false,
      alwaysOnTop: true
    } );

    w.setMenu( null );

    w.on( 'closed', () => {
      if( DEBUG ) { Util.log( 'The about application window was closed.' ); }

      this._windows.delete( WindowTypes.About );
    } );

    const filePath = Path.join( __dirname, 'window-about.html' );
    w.loadURL( 'file://' + filePath );

    this._windows.set( WindowTypes.About, w );
  }

  /**
   * Occurs when a show link requested.
   *
   * @param {IPCEvent} ev  Event data.
   * @param {String}   url URL.
   */
  _onRequestShowURL( ev, url ) {
    console.log( url );
    this._context.shell.openExternal( url );
    ev.sender.send( IPCKeys.FinishShowURL );
  }
}