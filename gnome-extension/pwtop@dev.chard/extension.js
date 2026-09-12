import Gio from 'gi://Gio';

const IFACE = `
<node>
  <interface name="dev.chard.Pwtop">
    <method name="Pin">
      <arg type="s" name="match" direction="in"/>
      <arg type="s" name="result" direction="out"/>
    </method>
    <method name="Unpin">
      <arg type="s" name="match" direction="in"/>
      <arg type="s" name="result" direction="out"/>
    </method>
    <method name="List">
      <arg type="s" name="result" direction="out"/>
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

    _windows() {
        let result = [];
        const ws = global.workspace_manager;
        for (let i = 0; i < ws.n_workspaces; i++) {
            result = result.concat(ws.get_workspace_by_index(i).list_windows());
        }
        return result;
    }

    _find(match) {
        for (const w of this._windows()) {
            if (w.title === match || (w.wm_class && w.wm_class.includes(match))) {
                return w;
            }
        }
        return null;
    }

    Pin(match) {
        const w = this._find(match);
        if (!w) return [`NOTFOUND: ${this.List()[0]}`];
        w.make_above();
        return [`PINNED: "${w.title}"`];
    }

    Unpin(match) {
        const w = this._find(match);
        if (!w) return [`NOTFOUND: ${this.List()[0]}`];
        w.unmake_above();
        return [`UNPINNED: "${w.title}"`];
    }

    List() {
        let lines = [];
        for (const w of this._windows()) {
            lines.push(`"${w.title}" wm="${w.wm_class}"`);
        }
        return [lines.join(' | ')];
    }
}
