/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50721
 Source Host           : localhost:3306
 Source Schema         : security_label

 Target Server Type    : MySQL
 Target Server Version : 50721
 File Encoding         : 65001

 Date: 16/05/2021 21:21:59
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for batch
-- ----------------------------
DROP TABLE IF EXISTS `batch`;
CREATE TABLE `batch` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `amount` int(11) NOT NULL COMMENT '数量',
  `memo` text COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for serial
-- ----------------------------
DROP TABLE IF EXISTS `serial`;
CREATE TABLE `serial` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `batch_id` int(11) NOT NULL COMMENT '批次编号',
  `serial` varchar(64) NOT NULL COMMENT '序列号',
  `code` varchar(8) NOT NULL COMMENT '防伪码',
  `dos` char(8) NOT NULL,
  `has_verified` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否验证过',
  `verify_date` datetime DEFAULT NULL COMMENT '验证日期',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `serial` (`serial`(12))
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
