package com.pmo.demo.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SkillMatchReportRow {

	private String autoReqId;
	private String clientName;
	private String skills;
	private List<EmployeeSkillMatch> employeeMatches;
	
}
