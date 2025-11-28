import { useState } from "react";
import { Plus, Search, Users, Briefcase, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Person {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string;
  type: 'visitor' | 'worker' | 'contractor';
  sector_id: string | null;
  check_in: string;
  check_out: string | null;
  created_at: string;
}

const PeopleManagement = () => {
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    type: "visitor" as 'visitor' | 'worker' | 'contractor',
    sector_id: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('people')
        .insert([{
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          company: formData.company,
          type: formData.type,
          sector_id: formData.sector_id || null
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Pessoa cadastrada com sucesso.",
      });

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        type: "visitor",
        sector_id: ""
      });
      
      setShowForm(false);
      loadPeople(); // Recarregar lista

    } catch (error) {
      console.error('Erro ao cadastrar pessoa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar a pessoa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPeople(data || []);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worker': return <Briefcase className="h-4 w-4" />;
      case 'contractor': return <UserCheck className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'worker': return 'Trabalhador';
      case 'contractor': return 'Contratado';
      default: return 'Visitante';
    }
  };

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Pessoas</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie visitantes, trabalhadores e contratados
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Pessoa
        </Button>
      </div>

      {/* Formulário de Cadastro */}
      <form onSubmit={handleSubmit} className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="name">Nome Completo *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="João Silva"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="email">Email (Opcional)</Label>
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        placeholder="joao@empresa.com"
        // REMOVA O required DAQUI
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="phone">Telefone (Opcional)</Label>
      <Input
        id="phone"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        placeholder="(11) 99999-9999"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="company">Empresa *</Label>
      <Input
        id="company"
        value={formData.company}
        onChange={(e) => handleInputChange('company', e.target.value)}
        placeholder="MEDIOTEC"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="type">Tipo *</Label>
      <Select
        value={formData.type}
        onValueChange={(value: 'visitor' | 'worker' | 'contractor') => 
          handleInputChange('type', value)
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="visitor">Visitante</SelectItem>
          <SelectItem value="worker">Trabalhador</SelectItem>
          <SelectItem value="contractor">Contratado</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="sector">Setor (Opcional)</Label>
      <Input
        id="sector"
        value={formData.sector_id}
        onChange={(e) => handleInputChange('sector_id', e.target.value)}
        placeholder="Lab. Ciências"
      />
    </div>
  </div>

  <div className="flex gap-2 pt-4">
    <Button 
      type="submit" 
      disabled={loading || !formData.name || !formData.company}
    >
      {loading ? "Cadastrando..." : "Cadastrar Pessoa"}
    </Button>
    <Button
      type="button"
      variant="outline"
      onClick={() => setShowForm(false)}
    >
      Cancelar
    </Button>
  </div>
</form>

      {/* Lista de Pessoas */}
      <Card>
        <CardHeader>
          <CardTitle>Pessoas Cadastradas</CardTitle>
          <CardDescription>
            {filteredPeople.length} pessoa(s) encontrada(s)
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, empresa ou email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Check-in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      {getTypeIcon(person.type)}
                      {getTypeLabel(person.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{person.company}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {person.email && <div className="text-sm">{person.email}</div>}
                      {person.phone && <div className="text-sm text-muted-foreground">{person.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(person.check_in).toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPeople.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma pessoa cadastrada encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeopleManagement;