import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, RefreshCcw, UserRound } from "lucide-react";

import { getMyTeacherInfo } from "@/services/teacherService";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function TeacherInfo() {
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadTeacherInfo() {
      try {
        const response = await getMyTeacherInfo();

        if (!ignore) {
          setTeacher(response.data);
          setErrorMessage("");
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to load teacher information.";

        if (!ignore) {
          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTeacherInfo();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleRefresh() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await getMyTeacherInfo();
      setTeacher(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to refresh teacher information.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
            Teacher
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
            My Information
          </h1>

          <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
            View your teacher profile, department, contact information, and
            system account status.
          </p>
        </div>

        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-md border border-[var(--sms-danger-border)] bg-[var(--sms-danger-bg)] p-4 text-sm text-[var(--sms-danger)]">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <Card className="sms-card">
          <CardContent className="p-8 text-[var(--sms-muted)]">
            Loading teacher information...
          </CardContent>
        </Card>
      ) : teacher ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <Card className="sms-card">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--sms-gold-soft)] text-[var(--sms-ink)]">
                <UserRound className="h-12 w-12" />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[var(--sms-ink)]">
                {teacher.fullName}
              </h2>

              <p className="mt-1 font-mono text-sm text-[var(--sms-muted)]">
                {teacher.teacherCode}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="sms-badge-info">
                  {teacher.role}
                </Badge>

                <Badge
                  variant="outline"
                  className={
                    teacher.status === "Active"
                      ? "sms-badge-active"
                      : "sms-badge-inactive"
                  }
                >
                  {teacher.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="sms-card">
            <CardContent className="p-8">
              <h3 className="mb-6 text-xl font-semibold text-[var(--sms-ink)]">
                Profile Details
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <InfoItem label="Username" value={teacher.username} />
                <InfoItem label="Gender" value={teacher.gender || "—"} />
                <InfoItem
                  label="Email"
                  value={teacher.email || "No email"}
                  icon={<Mail className="h-4 w-4" />}
                />

                <InfoItem
                  label="Phone"
                  value={teacher.phone || "No phone"}
                  icon={<Phone className="h-4 w-4" />}
                />

                <div className="md:col-span-2">
                  <InfoItem
                    label="Address"
                    value={teacher.address || "No address"}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="sms-card">
          <CardContent className="p-8 text-[var(--sms-muted)]">
            No teacher information found.
          </CardContent>
        </Card>
      )}
    </>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="rounded-md border border-[var(--sms-line)] bg-[var(--sms-card-soft)] p-4">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
        {icon}
        {label}
      </p>

      <p className="font-medium text-[var(--sms-ink)]">{value}</p>
    </div>
  );
}

export default TeacherInfo;
