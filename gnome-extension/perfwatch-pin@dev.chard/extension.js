import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const IFACE = `
<node>
  <interface name="dev.chard.Pin">
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

export default class PerfwatchPinExtension {
    enable() {
        this._obj = Gio.DBusExportedObject.wrapJSObject(IFACE, this);
        this._obj.export(Gio.DBus.session, '/dev/chard/Pin');
    }

    disable() {
        if (this._obj) { this._obj.unexport(); this._obj = null; }
    }

    _find(title) {
        const ws = global.workspace_manager;
        for (let i = 0; i < ws.n_workspaces; i++) {
            for (const w of ws.get_workspace_by_index(i).list_windows()) {
                if (w.title === title) return w;
            }
        }
        return null;
    }

    SetAbove(title, above) {
        const w = this._find(title);
        if (!w) return [false];
        if (above) w.make_above();
        else w.unmake_above();
        return [true];
    }

    IsAbove(title) {
        const w = this._find(title);
        if (!w) return [false];
        return [w.above];
    }
}
