import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

const IFACE_XML = `
<node>
  <interface name="dev.chard.Perfwatch">
    <method name="SetAbove">
      <arg type="s" name="title" direction="in"/>
      <arg type="b" name="above" direction="in"/>
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
        this._exported = Gio.DBusExportedObject.wrapJSObject(IFACE_XML, this);
        this._exported.export(Gio.DBus.session, '/dev/chard/Perfwatch');
    }

    disable() {
        if (this._exported) {
            this._exported.unexport();
            this._exported = null;
        }
    }

    _findWindow(title) {
        for (let i = 0; i < global.workspace_manager.n_workspaces; i++) {
            const ws = global.workspace_manager.get_workspace_by_index(i);
            for (const w of ws.list_windows()) {
                if (w.title === title) return w;
            }
        }
        return null;
    }

    SetAbove(title, above) {
        const w = this._findWindow(title);
        if (!w) return [false];
        // Check current state via Meta.Window API
        const isCurrentlyAbove = w.is_above();
        if (above && !isCurrentlyAbove) {
            w.make_above();
        } else if (!above && isCurrentlyAbove) {
            w.unmake_above();
        }
        return [true];
    }

    IsAbove(title) {
        const w = this._findWindow(title);
        return [w ? w.is_above() : false];
    }
}
