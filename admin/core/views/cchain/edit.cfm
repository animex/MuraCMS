<cfif not len(rc.chainID)>
  <cfset rc.chainID=createUUID()>
</cfif>
<cfset chain=$.getBean('approvalChain').loadBy(chainid=rc.chainID)/>
<cfoutput>


<div class="mura-header">
  <cfif not len(rc.chainid)>
	<h1>#application.rbFactory.getKeyValue(session.rb,"approvalchains.addapprovalchain")#</h1>
  <cfelse>
	<h1>#application.rbFactory.getKeyValue(session.rb,"approvalchains.editapprovalchain")#</h1>
  </cfif>

  <cfinclude template="dsp_secondary_menu.cfm">

</div> <!-- /.mura-header -->


<div class="block block-constrain">
    <div class="block block-bordered">
      <div class="block-content">

        <cfif not structIsEmpty(chain.getErrors())>
          <div class="alert alert-error"><span>#application.utility.displayErrors(chain.getErrors())#</span></div>
        </cfif>

      <form novalidate="novalidate" action="./?muraAction=cchain.save" method="post" name="form1" onsubmit="return validateForm(this);">
      <div class="mura-control-group">
         <label>
            #application.rbFactory.getKeyValue(session.rb,'approvalchains.name')#
         </label>
        <div>
          <input name="name" type="text" required="true" message="#application.rbFactory.getKeyValue(session.rb,'approvalchains.namerequired')#" value="#esapiEncode('html_attr',chain.getName())#" maxlength="50">
        </div>
        </div>
      <div class="mura-control-group">
          <label>
            #application.rbFactory.getKeyValue(session.rb,'approvalchains.description')#
          </label>
          <div>
          <textarea name="description" rows="6">#esapiEncode('html',chain.getDescription())#</textarea>
          </div>
      </div>

      <div class="mura-control-group" id="availableGroups">
      	<div class="alert alert-info">
          <span>The first group in the chain will be the first group to actually <em>approve</em> the content after it's been submitted.
          <strong>All content creators can send for approval without having to be in the chain.</strong></span>
      	</div>
        <label>
          <span class="half">#application.rbFactory.getKeyValue(session.rb,'approvalchains.groupsavailable')#</span> <span class="half">#application.rbFactory.getKeyValue(session.rb,'approvalchains.groupselected')#</span>
        </label>

        <div id="sortableGroups">
          <p class="dragMsg">
            <span class="dragFrom half">#application.rbFactory.getKeyValue(session.rb,'approvalchains.dragfrom')#&hellip;</span><span class="half">&hellip;#application.rbFactory.getKeyValue(session.rb,'approvalchains.dragto')#</span>
          </p>

          <ul id="groupAvailableListSort" class="groupDisplayListSortOptions">
            <cfset it=chain.getAvailableGroupsIterator()>
            <cfloop condition="it.hasNext()">
              <cfset item=it.next()>
              <li class="ui-state-default">
                #esapiEncode('html',item.getGroupName())#
                <input name="availableID" type="hidden" value="#item.getUserID()#">
              </li>
            </cfloop>
          </ul>

          <ol id="groupAssignmentListSort" class="groupDisplayListSortOptions">
            <cfset it=chain.getMembershipsIterator()>
            <cfloop condition="it.hasNext()">
              <cfset item=it.next()>
              <li class="ui-state-highlight">
                #esapiEncode('html',item.getGroup().getGroupName())#
                <input name="groupID" type="hidden" value="#item.getGroupID()#">
              </li>
            </cfloop>
          </ol>
          <script>
            $(function(){
                chainManager.setGroupMembershipSort();
              });
          </script>
        </div>
      </div>
      <div class="mura-actions">
        <div class="form-actions">
          <cfif rc.chainID eq ''>
            <button class="btn" type="button" onclick="submitForm(document.forms.form1,'add');">#application.rbFactory.getKeyValue(session.rb,'approvalchains.add')#<i class="mi-check-circle"></i></button>
          <cfelse>
            <button class="btn" type="button"onclick="confirmDialog('#esapiEncode('javascript',application.rbFactory.getKeyValue(session.rb,'approvalchains.deleteconfirm'))#','./?muraAction=cchain.delete&chainID=#chain.getchainID()#&siteid=#esapiEncode('url',chain.getSiteID())# #rc.$.renderCSRFTokens(context=chain.getchainID(),format="url")#');"><i class="mi-trash"></i>#application.rbFactory.getKeyValue(session.rb,'approvalchains.delete')#</button>
            <button class="btn mura-primary" type="button" onclick="submitForm(document.forms.form1,'save');"><i class="mi-check-circle"></i>#application.rbFactory.getKeyValue(session.rb,'approvalchains.update')#</button>
          </cfif>
          <input type="hidden" name="siteid" value="#chain.getSiteID()#">
          <input type=hidden name="chainID" value="#chain.getchainID()#">
          #rc.$.renderCSRFTokens(context=chain.getchainID(),format="form")#
        </div>
      </div>
      </form>
      <cfinclude template="js.cfm">
    </div> <!-- /.block-content -->
  </div> <!-- /.block-bordered -->
</div> <!-- /.block-constrain -->
</cfoutput>
