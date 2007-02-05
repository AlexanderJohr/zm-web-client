/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskTreeController(appCtxt, type, dropTgt) {
	if (arguments.length == 0) return;

	ZmFolderTreeController.call(this, appCtxt, (type || ZmOrganizer.TASKS), dropTgt);

	this._listeners[ZmOperation.NEW_TASK_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_TASKFOLDER] = new AjxListener(this, this._shareTaskFolderListener);
	this._listeners[ZmOperation.MOUNT_TASKFOLDER] = new AjxListener(this, this._mountTaskFolderListener);

	this._eventMgrs = {};
};

ZmTaskTreeController.prototype = new ZmFolderTreeController;
ZmTaskTreeController.prototype.constructor = ZmTaskTreeController;


// Public Methods
ZmTaskTreeController.prototype.toString =
function() {
	return "ZmTaskTreeController";
};

ZmTaskTreeController.prototype.show =
function(overviewId, showUnread, omit, forceCreate) {
	var firstTime = (!this._treeView[overviewId] || forceCreate);

	ZmTreeController.prototype.show.call(this, overviewId, showUnread, omit, forceCreate);

	if (firstTime) {
		var treeView = this.getTreeView(overviewId);
		var root = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item._isSeparator) continue;
			this._setTreeItemColor(item, item.getData(Dwt.KEY_OBJECT));
		}
	}
};

ZmTaskTreeController.prototype.resetOperations =
function(parent, type, id) {
	var deleteText = ZmMsg.del;
	var folder = this._dataTree.getById(id);

	parent.enableAll(true);
	if (folder && folder.isSystem()) {
		parent.enable([ZmOperation.DELETE, ZmOperation.RENAME_FOLDER], false);
	} else if (folder.link) {
		parent.enable([ZmOperation.SHARE_TASKFOLDER], false);
	}

	var op = parent.getOp(ZmOperation.DELETE);
	if (op) op.setText(deleteText);
};

/*
* Returns a "New Task Folder" dialog.
*/
ZmTaskTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewTaskFolderDialog();
};

ZmTaskTreeController.prototype._setTreeItemColor =
function(item, object) {
	var element = item.getHtmlElement();
	element.className = ZmOrganizer.COLOR_TEXT[object.color] + "Bg";
};

// Returns a list of desired header action menu operations
ZmTaskTreeController.prototype._getHeaderActionMenuOps =
function() {
	var ops = [ ZmOperation.NEW_TASK_FOLDER ];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED))
		ops.push(ZmOperation.MOUNT_TASK_FOLDER);
	return ops;
};

// Returns a list of desired action menu operations
ZmTaskTreeController.prototype._getActionMenuOps =
function() {
	var ops = [];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED))
		ops.push(ZmOperation.SHARE_TASKFOLDER);
	ops.push(ZmOperation.DELETE, ZmOperation.RENAME_FOLDER, ZmOperation.EDIT_PROPS);
	return ops;
};

ZmTaskTreeController.prototype._shareTaskFolderListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	this._appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

ZmTaskTreeController.prototype._mountTaskFolderListener =
function(ev) {
	this._appCtxt.getMountFolderDialog().popup(ZmOrganizer.TASKS);
};

ZmTaskTreeController.prototype._changeListener =
function(ev, treeView) {
	ZmFolderTreeController.prototype._changeListener.call(this, ev, treeView);

	if (ev.type != this.type) return;

	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var node = treeView.getTreeItemById(id);
		if (!node) continue;

		var fields = ev.getDetail("fields");
		// NOTE: ZmTreeController#_changeListener re-inserts the node if the
		//		 name changes so we need to reset the color in that case, too.
		if (ev.event == ZmEvent.E_CREATE ||
			(ev.event == ZmEvent.E_MODIFY && fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME])))
		{
			var object = node.getData(Dwt.KEY_OBJECT);
			this._setTreeItemColor(node, object);
		}
	}
};

ZmTaskTreeController.prototype._deleteListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var callback = new AjxCallback(this, this._deleteListener2, [organizer]);
	var message = AjxMessageFormat.format(ZmMsg.confirmDeleteTaskFolder, organizer.name);

	this._appCtxt.getConfirmationDialog().popup(message, callback);
};

ZmTaskTreeController.prototype._deleteListener2 =
function(organizer) {
	this._doDelete(organizer);
};

/*
* Called when a left click occurs (by the tree view listener). The folder that
* was clicked may be a search, since those can appear in the folder tree. The
* appropriate search will be performed.
*
* @param folder		ZmOrganizer		folder or search that was clicked
*/
ZmTaskTreeController.prototype._itemClicked =
function(folder) {
	var tapp = this._appCtxt.getApp(ZmZimbraMail.TASKS_APP);
	tapp.launch(null, null, folder.id);
};
