USE student_management_system;

INSERT INTO `users` (`username`, `password_hash`, `role`, `status`)
VALUES
(
  'admin',
  '$2b$10$CxjyLA3wE1sw9NQt03HopuN39d4U28eUEjLEhzva.GyvoHx2k8AQW',
  'admin',
  'active'
)
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `role` = VALUES(`role`),
  `status` = VALUES(`status`);
