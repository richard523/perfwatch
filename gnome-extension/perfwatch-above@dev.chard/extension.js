import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const IFACE_XML = `
<node>
  <interface name="dev.chard.PerfwatchAbove">
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

const BUS_NAME = 'dev.chard.PerfwatchAbove';
const OBJECT_PATH = '/dev/chard/PerfwatchAbove';

export default class PerfwatchAboveExtension {
    enable() {
        this._exported = Gio.DBusExportedObject.wrapJSObject(IFACE_XML, this);
        this._exported.export(Gio.DBus.session, OBJECT_PATH);

        // Acquire the bus name so callers can find us
        this._ownerId = Gio.DBus.session.own_name(
            BUS_NAME,
            Gio.BusNameOwnerFlags.NONE,
            null,
            null
        );
    }

    disable() {
        if (this._ownerId) {
            Gio.DBus.session.unown_name(this._ownerId);
            this._ownerId = null;
        }
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

    ToggleAbove(title) {
        const w = this._findWindow(title);
        if (!w) return [false];
        if (w.above) w.unmake_above();
        else w.make_above();
        return [true];
    }

    IsAbove(title) {
        const w = this._findWindow(title);
        return [w ? w.above : false];
    }
}
