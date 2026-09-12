import Gio from 'gi://Gio';

const IFACE = `
<node>
  <interface name="dev.chard.Pwtop">
    <method name="Pin">
      <arg type="s" name="match" direction="in"/>
      <arg type="b" name="success" direction="out"/>
    </method>
    <method name="Unpin">
      <arg type="s" name="match" direction="in"/>
      <arg type="b" name="success" direction="out"/>
    </method>
    <method name="Has">
      <arg type="s" name="match" direction="in"/>
      <arg type="b" name="found" direction="out"/>
    </method>
  </interface>
</node>`;

export default class PwtopExtension {
    enable() {
        this._obj = Gio.DBusExportedObject.wrapJSObject(IFACE, this);
        this._obj.export(Gio.DBus.session, '/dev/chard/Pwtop');
    }

    disable() {
        if (this._obj) { this._obj.unexport(); this._obj = null; }
    }

    _find(match) {
        const ws = global.workspace_manager;
        for (let i = 0; i < ws.n_workspaces; i++) {
            for (const w of ws.get_workspace_by_index(i).list_windows()) {
                if (w.title === match || (w.wm_class && w.wm_class.includes(match))) {
                    return w;
                }
            }
        }
        return null;
    }

    Pin(match) {
        const w = this._find(match);
        if (!w) return [false];
        w.make_above();
        return [true];
    }

    Unpin(match) {
        const w = this._find(match);
        if (!w) return [false];
        w.unmake_above();
        return [true];
    }

    Has(match) {
        return [this._find(match) !== null];
    }
}
