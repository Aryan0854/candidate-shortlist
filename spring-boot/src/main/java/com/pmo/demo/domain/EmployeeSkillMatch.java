package com.pmo.demo.domain;

import java.util.Map;

import lombok.Data;

@Data
public class EmployeeSkillMatch {
	
	private String employeeName;
	private Map<String, Double> skillMatch;
}
