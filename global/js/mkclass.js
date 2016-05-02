var mkclass = function(cls, parents)//{{{
{
    var self = this;

    if (!parents) parents = [];

    var c = function()
    {
        var i, k, p;

        for (k in cls)
        {
            class_addfield(this, cls, k);
        }

        class_parents(this, parents);

        cls['init'].apply(this, arguments);
    };

    c.cls = cls;
    c.parents = parents;

    return c;
}//}}}

var class_parents = function(self, parents)//{{{
{
    var i, k, p;

    for (i = 0; i < parents.length; i++)
    {
        p = parents[i];

        for (k in p.cls)
        {
            class_addfield(self, p.cls, k);
        }

        if (p.parents.length > 0)
        {
            class_parents(self, p.parents);
        }
    }
}//}}}

var class_addfield = function(self, cls, k)//{{{
{
    var sk = k;
    if (self[k] != undefined) sk = "super_" + k;

    if (cls[k].constructor == Function)
    {
        self[sk] = function ()
        {
            return cls[k].apply(self, arguments);
        }
        return;
    }

    self[sk] = cls[k];
}//}}}
