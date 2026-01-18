-- Add INSERT policy to prevent privilege escalation
CREATE POLICY "Only admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_admin());

-- Also add UPDATE and DELETE policies for complete protection
CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (is_admin());