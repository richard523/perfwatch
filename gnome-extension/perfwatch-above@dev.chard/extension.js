import Gio from 'gi://Gio';

const IFACE_XML = `
<node>
  <interface name="dev.chard.Perfwatch">
    <method name="ToggleAbove">
      <arg type="s" name="title" direction="in"/>
      <arg type="b" name="success" direction="out"/>
    </method>
    <method name="IsAbove">
      <arg type="s" name="title" direction="in"/>
      <arg type="b" name="above" direction="out"/>
    </method>
  </interface>
</node>`;

export default class PerfwatchAboveExtension {
    enable() {
        this._impl = Gio.DBusExportedObject.wrapJSObject(IFACE_XML, this);
        this._regId = Gio.DBus.session.register_object(
            '/dev/chard/Perfwatch', this._impl);
    }

    disable() {
        if (this._regId) {
            Gio.DBus.session.unregister_object(this._regId);
            this._regId = null;
        }
        this._impl = null;
    }

    _findWindow(title) {
        const ws = global.workspace_manager.get_active_workspace();
        for (const w of ws.list_windows()) {
            if (w.title === title) return w;
        }
        // Also check all workspaces
        for (let i = 0; i < global.workspace_manager.n_workspaces; i++) {
            const ws = global.workspace_manager.get_workspace_by_index(i);
            for (const w of ws.list_windows()) {
                if (w.title === title) return w;
            }
        }
        return null;
    }

    ToggleAbove(title) {
        const w = this._findWindow(title);
        if (!w) return [false];
        if (w.above) {
            w.unmake_above();
        } else {
            w.make_above();
        }
        return [true];
    }

    IsAbove(title) {
        const w = this._findWindow(title);
        return [w ? w.above : false];
    }
}
