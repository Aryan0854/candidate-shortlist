package com.pmo.demo.domain;

import java.util.Map;

public class CandidateMatch {

	private String employeeName;
	private Map<String, String> skillMatch;
	
	public CandidateMatch(String employeeName, Map<String, String> skillMatch) {
		this.employeeName = employeeName;
		this.skillMatch = skillMatch;	
	}

	public String getEmployeeName() {
		return employeeName;
	}

	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}

	public Map<String, String> getSkillMatch() {
		return skillMatch;
	}

	public void setSkillMatch(Map<String, String> skillMatch) {
		this.skillMatch = skillMatch;
	}

}
