<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="account" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZPhoneAccountBean" %>
<%@ attribute name="var" rtexprvalue="false" required="true" type="java.lang.String" %>
<%@ variable name-from-attribute="var" alias='outputVar' scope="AT_BEGIN" variable-class="com.zimbra.cs.taglib.bean.ZCallFeaturesBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:choose>
    <c:when test="${param.haveForwardFromList and !zm:actionSet(param, 'actionSave')}">
        <zm:createCallFeatures var="newFeatures" phone="${param.phone}"
            emailnotificationactive="${param.emailNotificationActive}" emailnotificationaddress="${param.emailNotificationAddress}"
            callforwardingactive="${param.callForwardingAllActive}" callforwardingforwardto="${param.callForwardingAllNumber}"
            selectivecallforwardingactive="${param.selectiveCallForwardingActive}" selectivecallforwardingforwardto="${param.selectiveCallForwardingNumber}"
            selectivecallforwardingforwardfrom="${paramValues.forwardNumbers}"
        />
        <c:set var="outputVar" value="${newFeatures}"/>
    </c:when>
    <c:otherwise>
        <c:set var="outputVar" value="${account.callFeatures}"/>
    </c:otherwise>
</c:choose>

