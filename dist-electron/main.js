import { BrowserWindow as e, app as t } from "electron";
import n from "node:path";
import { fileURLToPath as r } from "node:url";
//#region electron/main.ts
var i = n.dirname(r(import.meta.url)), a;
function o() {
	a = new e({
		width: 1280,
		height: 720,
		minWidth: 800,
		minHeight: 600,
		title: "Cosmos Engine",
		icon: n.join(i, "../dist/cosmos.png"),
		backgroundColor: "#121212",
		autoHideMenuBar: !0,
		webPreferences: {
			nodeIntegration: !0,
			contextIsolation: !1,
			webSecurity: !1
		}
	}), process.env.VITE_DEV_SERVER_URL ? a.loadURL(process.env.VITE_DEV_SERVER_URL) : a.loadFile(n.join(i, "../dist/index.html"));
}
t.whenReady().then(o), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && o();
});
//#endregion
