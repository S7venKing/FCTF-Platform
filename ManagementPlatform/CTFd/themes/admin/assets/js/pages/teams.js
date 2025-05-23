import $ from "jquery";
import CTFd from "../compat/CTFd";
import { ezAlert, ezQuery } from "../compat/ezq";
import "../compat/json";
import "./main";

function deleteSelectedTeams(_event) {
  let teamIDs = $("input[data-team-id]:checked").map(function () {
    return $(this).data("team-id");
  });
  let target = teamIDs.length === 1 ? "team" : "teams";

  ezQuery({
    title: "Delete Teams",
    body: `Are you sure you want to delete ${teamIDs.length} ${target}?`,
    success: function () {
      const reqs = [];
      for (var teamID of teamIDs) {
        reqs.push(
          CTFd.fetch(`/api/v1/teams/${teamID}`, {
            method: "DELETE",
          })
        );
      }
      Promise.all(reqs).then((_responses) => {
        window.location.reload();
      });
    },
  });
}

function bulkEditTeams(_event) {
  let teamIDs = $("input[data-team-id]:checked").map(function () {
    return $(this).data("team-id");
  });

  ezAlert({
    title: "Edit Teams",
    body: $(`
    <form id="teams-bulk-edit">
      <div class="form-group">
        <label>Banned</label>
        <select name="banned" data-initial="">
          <option value="">--</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div id = "Hidden" class="form-group">
        <label>Hidden</label>
        <select name="hidden" data-initial="">
          <option value="">--</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    </form>
    
    `),
    button: "Submit",
    success: function () {
      let data = $("#teams-bulk-edit").serializeJSON(true);
      const reqs = [];
      for (var teamID of teamIDs) {
        reqs.push(
          CTFd.fetch(`/api/v1/teams/${teamID}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          })
        );
      }
      Promise.all(reqs).then((_responses) => {
        window.location.reload();
      });
    },
  });
  const isJury = document.querySelector("#is_jury").value === "true";

  if (isJury) {
    document.querySelector("#Hidden").style.display = "none";
  }  
}

$(() => {
  $("#teams-delete-button").click(deleteSelectedTeams);
  $("#teams-edit-button").click(bulkEditTeams);
});
