import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          navigate("/auth");
          return;
        }

        // Temporary workaround until Supabase types are regenerated
        const { data: roles, error } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Erro ao verificar role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!roles);
          if (!roles) {
            toast({
              title: "Acesso Negado",
              description: "Você não tem permissão para acessar esta página.",
              variant: "destructive",
            });
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  return { isAdmin, loading };
};
